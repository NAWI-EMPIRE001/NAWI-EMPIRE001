/**
 * ======================================================
 * PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * FILE: config/platformPillars.js
 * PURPOSE: Canonical registry of all approved platform pillars.
 * ======================================================
 */

const platformPillars = Object.freeze(new Set([
    "arenaNode", "sovereignExchange", "visibilityEngine", 
    "culinaryMatrix", "aestheticNexus", "diamondbackForge", "sonicLedger"
]));

module.exports = Object.freeze({
    isValid: (pillarKey) => platformPillars.has(pillarKey),
    list: () => Array.from(platformPillars)
});
