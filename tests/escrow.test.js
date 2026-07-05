/**
 * ==========================================================
 * NAWI-EMPIRE001 ESCROW TEST SUITE
 * FILE: tests/escrow.test.js
 * ==========================================================
 */

const Escrow = require('../models/Escrow');

describe('Escrow Model', () => {

    it('should create escrow object', () => {

        const escrow = new Escrow({
            buyer: '685b00000000000000000001',
            seller: '685b00000000000000000002',
            amount: 100,
            status: 'LOCKED'
        });

        expect(escrow.amount).toBe(100);
        expect(escrow.status).toBe('LOCKED');
    });

});