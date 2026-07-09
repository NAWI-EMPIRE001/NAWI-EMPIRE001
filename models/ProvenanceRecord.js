"use strict";

const mongoose = require("mongoose");
const platformPillars = require("../config/platformPillars");

const OwnershipEventSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, trim: true, index: true },
    acquiredAt: { type: Date, required: true, default: Date.now },
    requestId: { type: String, required: true, trim: true },
    traceId: { type: String, default: null }
  },
  { _id: false }
);

const ProvenanceRecordSchema = new mongoose.Schema(
  {
    forensicStamp: { type: String, required: true, unique: true, index: true, immutable: true },
    pillar: { type: String, required: true, enum: platformPillars.list(), index: true },
    currentOwner: { type: String, required: true, index: true, trim: true },
    assetMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ownershipHistory: { type: [OwnershipEventSchema], default: [] },
    registeredAt: { type: Date, default: Date.now, immutable: true }
  },
  { collection: "provenance_records", timestamps: true, minimize: false, versionKey: false }
);

/* |-------------------------------------------------------------------------- | Compound indexes |-------------------------------------------------------------------------- */
ProvenanceRecordSchema.index({ forensicStamp: 1, currentOwner: 1 });
ProvenanceRecordSchema.index({ pillar: 1, currentOwner: 1 });

module.exports = mongoose.models.ProvenanceRecord || mongoose.model(
  "ProvenanceRecord",
  ProvenanceRecordSchema
);
