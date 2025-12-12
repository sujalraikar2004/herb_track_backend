import express from 'express';

const app = express();
const PORT = 8000;

console.log('Starting test server...');

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

console.log('After listen() call');
