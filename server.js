import http from 'node:http';
import { createApp } from './src/app.js';
import { HOST, parsePort } from './src/config.js';
import { readContactConfig } from './src/contact/config.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

let port;
try {
  port = parsePort(process.env.PORT);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

// Report contact-form readiness by variable name only, never by value.
const contact = readContactConfig(process.env);
if (contact.configured) {
  console.log('Contact form: email delivery configured.');
  if (contact.secretIsEphemeral) {
    console.log('Contact form: CONTACT_FORM_SECRET not set; open forms must be resubmitted after a restart.');
  }
} else {
  console.log(`Contact form: unavailable until these are set: ${contact.missing.join(', ')}.`);
}

const server = http.createServer(createApp());

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
  } else {
    console.error('Server failed to start:', error.message);
  }
  process.exit(1);
});

server.listen(port, HOST, () => {
  // The server binds to all interfaces (HOST) for Railway, but 0.0.0.0 is not
  // a browsable address, so print a localhost URL that terminals can link.
  console.log(`Local: http://localhost:${server.address().port}`);
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down.`);

  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });

  // If open connections keep the server alive, exit anyway.
  setTimeout(() => {
    console.error('Shutdown timed out; exiting.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
