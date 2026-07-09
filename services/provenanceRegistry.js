"use strict";

const mongoose = require("mongoose");
const ProvenanceRecord = require("../models/ProvenanceRecord");
const watermarkService = require("./watermarkService");
const auditService = require("./auditService");
const platformPillars = require("../config/platformPillars");

class ProvenanceRegistry {
  constructor() {
    this.memoryFallback = new Map();

    // Prevent unbounded memory growth in test/dev environments
    this.MAX_MEMORY_RECORDS =
      Number(process.env.MAX_MEMORY_RECORDS) || 5000;
  }

  get isMemoryMode() {
    return (
      process.env.NODE_ENV === "test" ||
      mongoose.connection.readyState !== 1
    );
  }

  async register(
    pillar,
    initialOwnerId,
    assetData,
    trackingCtx = {}
  ) {
    if (!platformPillars.isValid(pillar)) {
      throw new Error(`Invalid pillar supplied: ${pillar}`);
    }

    const ctx =
      auditService.createTrackingContext(trackingCtx);

    const stamp = await watermarkService.createWatermark({
      pillar,
      initialOwnerId,
      assetData
    });

    /*
     * =====================================================
     * Memory Fallback Mode
     * =====================================================
     */
    if (this.isMemoryMode) {
      if (this.memoryFallback.has(stamp)) {
        return this.memoryFallback.get(stamp);
      }

      // FIFO eviction strategy
      if (
        this.memoryFallback.size >=
        this.MAX_MEMORY_RECORDS
      ) {
        const oldestKey =
          this.memoryFallback.keys().next().value;

        this.memoryFallback.delete(oldestKey);
      }

      const memoryRecord = {
        forensicStamp: stamp,
        pillar,
        currentOwner: initialOwnerId,
        assetMetadata: assetData,
        ownershipHistory: [
          {
            ownerId: initialOwnerId,
            acquiredAt: new Date(),
            requestId: ctx.requestId,
            traceId: ctx.traceId
          }
        ],
        registeredAt: new Date()
      };

      this.memoryFallback.set(
        stamp,
        memoryRecord
      );

      await auditService.emitTrace(
        initialOwnerId,
        pillar,
        "ASSET_MINT",
        { stamp },
        ctx
      );

      return memoryRecord;
    }

    /*
     * =====================================================
     * Production Database Mode
     * =====================================================
     */
    try {
      const record =
        await ProvenanceRecord.create({
          forensicStamp: stamp,
          pillar,
          currentOwner: initialOwnerId,
          assetMetadata: assetData,
          ownershipHistory: [
            {
              ownerId: initialOwnerId,
              acquiredAt: new Date(),
              requestId: ctx.requestId,
              traceId: ctx.traceId
            }
          ]
        });

      await auditService.emitTrace(
        initialOwnerId,
        pillar,
        "ASSET_MINT",
        { stamp },
        ctx
      );

      return record;
    } catch (error) {
      /*
       * Duplicate registration race protection
       */
      if (error.code === 11000) {
        return ProvenanceRecord.findOne({
          forensicStamp: stamp
        });
      }

      throw error;
    }
  }
}

module.exports = new ProvenanceRegistry();