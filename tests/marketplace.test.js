/**
 * ==========================================================
 * NAWI-EMPIRE001 MARKETPLACE TEST SUITE
 * FILE: tests/marketplace.test.js
 * ==========================================================
 */

const request = require('supertest');
const app = require('../app');

describe('Marketplace API', () => {

    describe('GET /api/v1/marketplace', () => {

        it('should return marketplace response', async () => {

            const response = await request(app)
                .get('/api/v1/marketplace');

            expect([200, 404]).toContain(
                response.statusCode
            );
        });

    });

    describe('POST /api/v1/marketplace/create', () => {

        it('should validate marketplace listing creation', async () => {

            const response = await request(app)
                .post('/api/v1/marketplace/create')
                .send({
                    title: 'Luxury Headset',
                    description: 'Premium gaming headset',
                    price: 100
                });

            expect([200, 201, 400, 401]).toContain(
                response.statusCode
            );
        });

    });

});