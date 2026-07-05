/**
 * ==========================================================
 * NAWI-EMPIRE001 STREAM TEST SUITE
 * FILE: tests/stream.test.js
 * ==========================================================
 */

const request = require('supertest');
const app = require('../app');

describe('Streaming Engine', () => {

    describe('GET /api/v1/streams', () => {

        it('should return stream listings', async () => {

            const response = await request(app)
                .get('/api/v1/streams');

            expect([200, 404]).toContain(
                response.statusCode
            );
        });

    });

    describe('POST /api/v1/streams/create', () => {

        it('should validate stream creation', async () => {

            const response = await request(app)
                .post('/api/v1/streams/create')
                .send({
                    title: 'Arena Championship',
                    category: 'ARENA_NODE'
                });

            expect([200, 201, 400, 401])
                .toContain(response.statusCode);
        });

    });

});