#!/usr/bin/env node
/** Production configuration preflight. Never prints secret values. */

const required = ['FIREBASE_PROJECT_ID', 'CORS_ORIGIN'];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error(`Missing required production variables: ${missing.join(', ')}`);
  process.exit(1);
}

const origins = process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean);
const invalidOrigin = origins.find((origin) =>
  !origin.startsWith('https://') && origin !== 'capacitor://localhost'
);

if (invalidOrigin) {
  console.error(`Invalid production CORS origin: ${invalidOrigin}`);
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && !process.env.VITE_SERVER_API_BASE_URL?.trim()) {
  console.warn('VITE_SERVER_API_BASE_URL is not set; the mobile/web client may not reach the API.');
}

console.log('Production configuration preflight passed.');
