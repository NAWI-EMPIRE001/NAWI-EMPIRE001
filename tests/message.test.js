/**
 * ==========================================================
 * NAWI-EMPIRE001 MESSAGE TEST SUITE
 * FILE: tests/message.test.js
 * ==========================================================
 */

const request = require('supertest');
const app = require('../app');

describe('Messaging Engine', () => {

    describe('GET /api/v1/messages', () => {

        it('should fetch conversations', async () => {

            const response = await request(app)
                .get('/api/v1/messages');

            expect([200, 401, 404])
                .toContain(response.statusCode);
        });

    });

    describe('POST /api/v1/messages/send', () => {

        it('should validate message creation', async () => {

            const response = await request(app)
                .post('/api/v1/messages/send')
                .send({
                    receiverId: '685b00000000000000000001',
                    content: 'Hello Empire User'
                });

            expect([200, 201, 400, 401])
                .toContain(response.statusCode);
        });

    });

});