#!/usr/bin/env node
import { spawn } from 'node:child_process';

const preflight = spawn(process.execPath, ['scripts/production-preflight.mjs'], {
  stdio: 'inherit',
  env: process.env,
});

preflight.on('exit', (code) => {
  if (code !== 0) process.exit(code ?? 1);

  const server = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  const stop = (signal) => server.kill(signal);
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));

  server.on('exit', (serverCode, serverSignal) => {
    if (serverSignal) process.kill(process.pid, serverSignal);
    process.exit(serverCode ?? 1);
  });
});
