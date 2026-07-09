"use strict";

/**
 * ==========================================================
 * PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * FILE: config/platformPillars.js
 * PURPOSE: Canonical registry of all approved platform pillars.
 *
 * DESCRIPTION:
 * - Single source of truth for all platform pillar names.
 * - Provides O(1) validation lookups.
 * - Provides O(1) normalization lookups.
 * - Provides O(1) reverse lookups.
 * - Prevents accidental runtime mutation.
 * ==========================================================
 */

/*
|--------------------------------------------------------------------------
| Canonical Pillar Registry
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Never hardcode pillar strings elsewhere in the codebase.
| Always import and use these constants.
|
*/
const PILLARS = Object.freeze({
    SOVEREIGN_EXCHANGE: "sovereignExchange",
    DIAMONDBACK_FORGE: "diamondbackForge",
    SONIC_LEDGER: "sonicLedger",
    ARENA_NODE: "arenaNode",
    VISIBILITY_ENGINE: "visibilityEngine",
    CULINARY_MATRIX: "culinaryMatrix",
    AESTHETIC_NEXUS: "aestheticNexus"
});

/*
|--------------------------------------------------------------------------
| Immutable Derived Structures
|--------------------------------------------------------------------------
*/

const PILLAR_VALUES = Object.freeze(
    Object.values(PILLARS)
);

const PILLAR_SET = new Set(PILLAR_VALUES);

const PILLAR_LOWER_MAP = Object.freeze(
    PILLAR_VALUES.reduce((map, pillar) => {
        map[pillar.toLowerCase()] = pillar;
        return map;
    }, Object.create(null))
);

const REVERSE_LOOKUP_MAP = Object.freeze(
    Object.entries(PILLARS).reduce((map, [key, value]) => {
        map[value] = key;
        return map;
    }, Object.create(null))
);

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

/**
 * Returns an immutable copy of all registered pillars.
 *
 * Example:
 * list()
 * -> [
 *      "sovereignExchange",
 *      "diamondbackForge",
 *      ...
 *    ]
 *
 * @returns {string[]}
 */
function list() {
    return [...PILLAR_VALUES];
}

/**
 * Validates whether a pillar exists in the registry.
 *
 * Complexity:
 * O(1)
 *
 * @param {string} pillar
 * @returns {boolean}
 */
function isValid(pillar) {
    return (
        typeof pillar === "string" &&
        PILLAR_SET.has(pillar)
    );
}

/**
 * Converts arbitrary user input into the canonical pillar value.
 *
 * Examples:
 *
 * normalize(" ARENANODE ")
 * -> "arenaNode"
 *
 * normalize("DiamondBackForge")
 * -> "diamondbackForge"
 *
 * normalize("invalidPillar")
 * -> null
 *
 * Complexity:
 * O(1)
 *
 * @param {string} value
 * @returns {string|null}
 */
function normalize(value) {
    if (typeof value !== "string") {
        return null;
    }

    const normalized =
        value.trim().toLowerCase();

    return PILLAR_LOWER_MAP[normalized] || null;
}

/**
 * Performs reverse lookup from pillar value to constant key.
 *
 * Examples:
 *
 * getKeyByValue("arenaNode")
 * -> "ARENA_NODE"
 *
 * getKeyByValue("diamondbackForge")
 * -> "DIAMONDBACK_FORGE"
 *
 * Complexity:
 * O(1)
 *
 * @param {string} value
 * @returns {string|null}
 */
function getKeyByValue(value) {
    if (typeof value !== "string") {
        return null;
    }

    return REVERSE_LOOKUP_MAP[value] || null;
}

/*
|--------------------------------------------------------------------------
| Immutable Export Surface
|--------------------------------------------------------------------------
*/

module.exports = Object.freeze({
    PILLARS,
    list,
    isValid,
    normalize,
    getKeyByValue
});