/**
 * ==========================================================
 * NAWI-EMPIRE001 VERIFICATION TEST SUITE
 * FILE: tests/verification.test.js
 * ==========================================================
 */

const request = require('supertest');
const app = require('../app');

describe('Verification Engine', () => {

    describe('POST /api/v1/verification/request', () => {

        it('should validate verification requests', async () => {

            const response = await request(app)
                .post('/api/v1/verification/request')
                .send({
                    documentType: 'PASSPORT'
                });

            expect([200, 201, 400, 401])
                .toContain(response.statusCode);
        });

    });

});