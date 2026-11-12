import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import os from 'node:os';
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

const PREVIEW_LINE = /^Local: (http:\/\/localhost:\d+)$/m;

// Resolves with the preview URL printed at startup.
async function waitForListening(proc, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = proc.output().stdout.match(PREVIEW_LINE);
    if (match) return match[1];
    if (proc.child.exitCode !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Server did not start. stderr: ${proc.output().stderr}`);
}

// A non-loopback IPv4 address of this machine, if it has one.
function externalIPv4() {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal) return address.address;
    }
  }
  return null;
}

describe('server.js startup', () => {
  it('prints a usable localhost preview URL for the configured PORT', async () => {
    const port = await getFreePort();
    const proc = startServer({ PORT: String(port) });
    try {
      const previewUrl = await waitForListening(proc);
      assert.equal(previewUrl, `http://localhost:${port}`);
      // 0.0.0.0 is a bind address, not a browsable one, so it must not be shown.
      assert.doesNotMatch(proc.output().stdout, /0\.0\.0\.0/);

      // Follow the printed link exactly as a developer would.
      const res = await fetch(`${previewUrl}/healthz`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { status: 'ok' });
    } finally {
      proc.child.kill();
      await proc.exited;
    }
  });

  const lanAddress = externalIPv4();

  it(
    'binds to 0.0.0.0, accepting loopback and non-loopback connections',
    { skip: !lanAddress && 'no non-loopback IPv4 interface available' },
    async () => {
      const port = await getFreePort();
      const proc = startServer({ PORT: String(port) });
      try {
        await waitForListening(proc);
        // A loopback-only bind would refuse the LAN address; 0.0.0.0 accepts both.
        for (const host of ['127.0.0.1', lanAddress]) {
          const res = await fetch(`http://${host}:${port}/healthz`);
          assert.equal(res.status, 200, `reachable via ${host}`);
        }
      } finally {
        proc.child.kill();
        await proc.exited;
      }
    },
  );

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
