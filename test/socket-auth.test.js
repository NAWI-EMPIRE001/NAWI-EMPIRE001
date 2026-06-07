// Integration test for socket auth (Mocha + Chai + socket.io-client)
const ioClient = require('socket.io-client');
const jwt = require('jsonwebtoken');
const { expect } = require('chai');

const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:10000';
const JWT_SECRET = process.env.JWT_SECRET || 'NAWI_EMPIRE_SECRET';

describe('Socket.IO authentication', function() {
  this.timeout(5000);

  it('should connect with a valid token', (done) => {
    const token = jwt.sign({ userId: process.env.TEST_USER_ID || 'test-user' }, JWT_SECRET, { expiresIn: '1h' });
    const socket = ioClient(SERVER_URL, { auth: { token }, transports: ['websocket'], reconnection: false });

    socket.on('connect', () => {
      socket.close();
      done();
    });

    socket.on('connect_error', (err) => {
      socket.close();
      done(err);
    });
  });

  it('should be rejected without a token', (done) => {
    const socket = ioClient(SERVER_URL, { transports: ['websocket'], reconnection: false });

    socket.on('connect', () => {
      socket.close();
      done(new Error('Connected without token'));
    });

    socket.on('connect_error', (err) => {
      // expected path
      socket.close();
      done();
    });
  });
});
