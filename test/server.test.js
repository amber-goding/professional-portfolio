import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const serverPath = fileURLToPath(new URL('../server.js', import.meta.url));

// Ask the OS for a free port, then release it for the child process.
function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function startServer(env) {
  const child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => (stdout += chunk));
  child.stderr.on('data', (chunk) => (stderr += chunk));
  const exited = new Promise((resolve) => child.on('exit', (code, signal) => resolve({ code, signal })));
  return { child, exited, output: () => ({ stdout, stderr }) };
}

async function waitForListening(proc, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (proc.output().stdout.includes('Server listening')) return;
    if (proc.child.exitCode !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Server did not start. stderr: ${proc.output().stderr}`);
}

describe('server.js startup', () => {
  it('listens on the PORT it is given, bound to 0.0.0.0', async () => {
    const port = await getFreePort();
    const proc = startServer({ PORT: String(port) });
    try {
      await waitForListening(proc);
      assert.match(proc.output().stdout, new RegExp(`http://0\\.0\\.0\\.0:${port}`));

      const res = await fetch(`http://127.0.0.1:${port}/healthz`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { status: 'ok' });
    } finally {
      proc.child.kill();
      await proc.exited;
    }
  });

  it('exits with a clear error for an invalid PORT without echoing the value', async () => {
    const proc = startServer({ PORT: 'not-a-port-SENSITIVE' });
    const { code } = await proc.exited;
    const { stderr } = proc.output();
    assert.equal(code, 1);
    assert.match(stderr, /Invalid PORT: expected a whole number from 1 to 65535\./);
    assert.doesNotMatch(stderr, /SENSITIVE/);
  });

  it(
    'shuts down cleanly on SIGTERM',
    { skip: process.platform === 'win32' && 'Windows cannot deliver SIGTERM to a child process' },
    async () => {
      const port = await getFreePort();
      const proc = startServer({ PORT: String(port) });
      await waitForListening(proc);
      proc.child.kill('SIGTERM');
      const { code } = await proc.exited;
      assert.equal(code, 0);
      assert.match(proc.output().stdout, /SIGTERM received, shutting down\.[\s\S]*Server closed\./);
    },
  );
});
