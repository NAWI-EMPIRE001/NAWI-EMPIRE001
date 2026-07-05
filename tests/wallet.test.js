/**
 * ==========================================================
 * NAWI-EMPIRE001 WALLET TEST SUITE
 * FILE: tests/wallet.test.js
 * ==========================================================
 */

const WalletModule = require('../models/Wallet');

const Wallet = WalletModule.Wallet;

describe('Wallet Engine', () => {

    let wallet;

    beforeEach(() => {

        wallet = new Wallet({
            user: '685b00000000000000000001',
            coinBalance: 100
        });

    });

    it('should credit wallet', async () => {

        await wallet.credit(50);

        expect(wallet.coinBalance).toBe(150);
    });

    it('should debit wallet', async () => {

        await wallet.debit(20);

        expect(wallet.coinBalance).toBe(80);
    });

    it('should lock escrow', async () => {

        await wallet.lockEscrow(40);

        expect(wallet.coinBalance).toBe(60);
        expect(wallet.escrowBalance).toBe(40);
    });

});