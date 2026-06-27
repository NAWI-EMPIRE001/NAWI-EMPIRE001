const mongoose = require('mongoose');

/**
 * =========================================================
 * NAWI-EMPIRE001
 * ATOMIC DATABASE TRANSACTION ENGINE + FINTECH MATHEMATICS
 * =========================================================
 */

/**
 * UTILITY: Custom sleep delay for dynamic transaction spacing
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core ACID Transaction Runner
 */
const runTransaction = async (operation) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction({
            readConcern: { level: 'majority' },
            writeConcern: { w: 'majority' }
        });

        const result = await operation(session);

        // Fixed: Handles edge case network failures precisely at commit execution time
        await commitWithRetry(session);
        return result;
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        await session.endSession();
    }
};

/**
 * Fixed: Explicitly handles 'UnknownTransactionCommitResult' errors from MongoDB
 */
const commitWithRetry = async (session) => {
    try {
        await session.commitTransaction();
    } catch (error) {
        const isCommitRetryable = error?.errorLabels?.includes('UnknownTransactionCommitResult');
        if (isCommitRetryable) {
            console.warn('Commit failed due to network glitch. Retrying commit operation...');
            await commitWithRetry(session);
        } else {
            throw error;
        }
    }
};

/**
 * Enhanced: Advanced Transaction Wrapper featuring Exponential Backoff
 */
const runTransactionWithRetry = async (operation, maxRetries = 3) => {
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            return await runTransaction(operation);
        } catch (error) {
            attempt++;

            const isTransientError = error?.errorLabels?.includes('TransientTransactionError');
            
            if (!isTransientError || attempt >= maxRetries) {
                // Formatting clean messaging out of system exceptions
                error.message = `[Transaction Engine Error]: ${error.message}`;
                throw error;
            }

            // Exponential backoff strategy calculation (e.g., 50ms, 100ms, 200ms)
            const backoffDelay = Math.pow(2, attempt) * 25;
            console.warn(`Transient conflict detected. Retrying transaction execution ${attempt}/${maxRetries} after ${backoffDelay}ms...`);
            await sleep(backoffDelay);
        }
    }
};

/**
 * =========================================================
 * FINANCIAL SAFETY VALIDATOR & ARITHMETIC CORRECTION
 * =========================================================
 */

const validateAmount = (amount) => {
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
        throw new Error('Fintech Violation: Invalid transaction amount format.');
    }
    if (amount <= 0) {
        throw new Error('Fintech Violation: Transaction amount must be strictly greater than zero.');
    }
    return true;
};

/**
 * Fixed Missing Layer: Protects the engine from floating-point arithmetic glitches
 */
const safeMoneyMath = {
    add: (val1, val2) => parseFloat((val1 + val2).toFixed(4)),
    subtract: (val1, val2) => parseFloat((val1 - val2).toFixed(4)),
    multiply: (val1, val2) => parseFloat((val1 * val2).toFixed(4))
};

/**
 * =========================================================
 * ID GENERATORS
 * =========================================================
 */

const generateTransactionId = () => {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const generateLedgerId = () => {
    return `LEDGER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const generateEscrowId = () => {
    return `ESCROW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

models.exports = {
    runTransaction,
    runTransactionWithRetry,
    validateAmount,
    safeMoneyMath,
    generateTransactionId,
    generateLedgerId,
    generateEscrowId
};
