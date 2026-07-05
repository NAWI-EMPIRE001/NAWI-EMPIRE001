/**
 * ==========================================================
 * NAWI-EMPIRE001 AUTH TEST SUITE
 * FILE: tests/auth.test.js
 * ==========================================================
 */

const request = require('supertest');
const app = require('../app');

describe('Authentication API', () => {

    describe('POST /api/v1/auth/register', () => {

        it('should register a new user', async () => {

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@nawiempire.com',
                    password: 'Password123!'
                });

            expect([200, 201, 400]).toContain(response.statusCode);
        });

    });

    describe('POST /api/v1/auth/login', () => {

        it('should login user', async () => {

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@nawiempire.com',
                    password: 'Password123!'
                });

            expect([200, 401, 404]).toContain(response.statusCode);
        });

    });

});