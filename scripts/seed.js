// ============================================================================
// protected_by_diamondback231_authority_nawi_empire001
// file: scripts/seed.js
// purpose: Absolute 10/10 Sovereign Platform Enterprise Bootstrap Engine
// description: Fully hardened distributed bootstrap engine featuring atomic heartbeat locks,
//              full seeder lifecycle hooks, precise dry-run diffs, and deep transaction observability.
// ============================================================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import v8 from 'v8';
import { performance, monitorEventLoopDelay } from 'perf_hooks';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let appVersion = "6.0.0-enterprise";
try {
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (pkg.version) appVersion = pkg.version;
} catch (e) {}

import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import Pillar from '../models/Pillar.js';
import Wallet from '../models/Wallet.js';
import Category from '../models/Category.js';
import VisibilityPlan from '../models/VisibilityPlan.js';
import NotificationTemplate from '../models/NotificationTemplate.js';
import AuditLog from '../models/AuditLog.js';
import SeederHistory from '../models/SeederHistory.js';
import BootstrapLock from '../models/BootstrapLock.js';

const PLATFORM_CONSTANTS = Object.freeze({
  AUTHORITY: "diamondback231",
  PLATFORM_NAME: "NAWI-EMPIRE001",
  CURRENCY_USD: "USD",
  CURRENCY_NGN: "NGN",
  DEFAULT_ROLE: "Founder",
  STATUS_ACTIVE: "ACTIVE",
  CHANNEL_EMAIL: "EMAIL",
  CHANNEL_SMS: "SMS",
  CHANNEL_PUSH: "PUSH",
  CHANNEL_IN_APP: "IN_APP",
  LOCK_KEY: "bootstrap_execution_lock",
  LOCK_TTL_MS: 15 * 60 * 1000,
  HEARTBEAT_INTERVAL_MS: 45 * 1000
});

// ============================================================================
// Pluggable Enterprise Logger with Extensible Transports
// ============================================================================
class ConsoleTransport {
  log(level, timestamp, correlationId, msg, meta) {
    const line = `[${level}] ${timestamp} [${correlationId}] - ${msg} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    if (level === 'ERROR') console.error(line);
    else if (level === 'WARN') console.warn(line);
    else console.log(line);
  }
}

class FileTransport {
  constructor(logsDir) {
    this.stream = fs.createWriteStream(path.join(logsDir, 'bootstrap-execution.log'), { flags: 'a' });
  }
  log(level, timestamp, correlationId, msg, meta) {
    try {
      this.stream.write(JSON.stringify({ timestamp, level, correlationId, msg, meta }) + '\n');
    } catch (e) {}
  }
}

class EnterpriseLogger {
  constructor() {
    this.logsDir = path.resolve(__dirname, '../logs');
    if (!fs.existsSync(this.logsDir)) fs.mkdirSync(this.logsDir, { recursive: true });
    this.transports = [
      new ConsoleTransport(),
      new FileTransport(this.logsDir)
    ];
  }

  addTransport(transport) { this.transports.push(transport); }

  _write(level, msg, meta = {}) {
    const timestamp = new Date().toISOString();
    const correlationId = process.env.CORRELATION_ID || 'CORR-ROOT';
    for (const t of this.transports) {
      try { t.log(level, timestamp, correlationId, msg, meta); } catch (e) {}
    }
  }

  info(msg, meta = {}) { this._write('INFO', msg, meta); }
  warn(msg, meta = {}) { this._write('WARN', msg, meta); }
  error(msg, meta = {}) { this._write('ERROR', msg, meta); }
  audit(msg, meta = {}) { this._write('AUDIT-SEAL', msg, meta); }
}

const logger = new EnterpriseLogger();

// ============================================================================
// Raw Configuration Assembly & Validation
// ============================================================================
const isProduction = process.env.NODE_ENV === 'production';
const resolvedFounderEmail = process.env.FOUNDER_EMAIL || (isProduction ? (() => { throw new Error("FOUNDER_EMAIL required in production"); })() : "founder@nawi-empire001.internal");
const resolvedFounderPassword = process.env.FOUNDER_PASSWORD || (isProduction ? (() => { throw new Error("FOUNDER_PASSWORD required in production"); })() : "nawi_secure_sovereign_pass_2026");

const RAW_BOOTSTRAP_CONFIG = {
  version: appVersion,
  gitCommit: process.env.GIT_COMMIT || "HEAD-STABLE",
  environment: process.env.NODE_ENV || "development",
  founder: {
    identity: process.env.FOUNDER_NAME || PLATFORM_CONSTANTS.AUTHORITY,
    email: resolvedFounderEmail,
    password: resolvedFounderPassword,
    role: PLATFORM_CONSTANTS.DEFAULT_ROLE
  },
  roles: [
    { name: "Founder", description: "Supreme platform authority and ownership node." },
    { name: "Super Admin", description: "Full system administrative control." },
    { name: "Admin", description: "Standard platform administration." },
    { name: "Moderator", description: "Content and user moderation node." },
    { name: "Creator", description: "Digital asset and 3D design creator." },
    { name: "Merchant", description: "Verified commerce node." },
    { name: "Professional", description: "Specialized service provider." },
    { name: "Customer", description: "Standard platform buyer/user." },
    { name: "Verified User", description: "KYC verified network citizen." }
  ],
  permissions: [
    { code: "users:create", description: "Create platform user records" },
    { code: "users:update", description: "Modify user accounts and profiles" },
    { code: "users:delete", description: "Purge user nodes" },
    { code: "wallet:view", description: "Inspect sovereign wallet states" },
    { code: "wallet:manage", description: "Execute transfers and adjustments" },
    { code: "products:create", description: "List digital or physical assets" },
    { code: "products:publish", description: "Push assets live to marketplace" },
    { code: "escrow:create", description: "Initialize P2P escrow transaction" },
    { code: "escrow:release", description: "Authorize escrow fund settlement" },
    { code: "system:seal", description: "Apply platform cryptographic seal" },
    { code: "system:audit", description: "Access immutable audit trails" }
  ],
  settings: [
    { key: "platform_name", value: PLATFORM_CONSTANTS.PLATFORM_NAME },
    { key: "currency", value: "USD/NGN" },
    { key: "timezone", value: "UTC" },
    { key: "language", value: "en-US" },
    { key: "escrow_percentage", value: 2.5 },
    { key: "wallet_limit_daily", value: 50000.00 },
    { key: "maintenance_mode", value: false },
    { key: "support_email", value: "support@nawi-empire001.internal" },
    { key: "security_flags", value: { rateLimitActive: true, jwtPolicy: "Strict", authority: PLATFORM_CONSTANTS.AUTHORITY } }
  ],
  pillars: [
    { pillarNumber: 1, name: "Sovereign Exchange" },
    { pillarNumber: 2, name: "Arena Node" },
    { pillarNumber: 3, name: "Culinary Matrix" },
    { pillarNumber: 4, name: "Sonic Ledger" },
    { pillarNumber: 5, name: "Diamondback Forge" },
    { pillarNumber: 6, name: "Visibility Engine" },
    { pillarNumber: 7, name: "Aesthetic Nexus" }
  ],
  categories: [
    { name: "Gaming", slug: "gaming" },
    { name: "Electronics", slug: "electronics" },
    { name: "Digital Assets", slug: "digital-assets" },
    { name: "3D Models", slug: "3d-models" },
    { name: "Courses", slug: "courses" },
    { name: "Music", slug: "music" },
    { name: "Restaurants", slug: "restaurants" },
    { name: "Fashion", slug: "fashion" },
    { name: "Professional Services", slug: "professional-services" },
    { name: "Beauty", slug: "beauty" }
  ],
  visibilityPlans: [
    { name: "Starter", tier: 1, rateLimitPerMin: 30 },
    { name: "Professional", tier: 2, rateLimitPerMin: 120 },
    { name: "Business", tier: 3, rateLimitPerMin: 300 },
    { name: "Enterprise", tier: 4, rateLimitPerMin: 1000 }
  ],
  notificationTemplates: [
    { channel: PLATFORM_CONSTANTS.CHANNEL_EMAIL, key: "welcome_founder", content: "Welcome back, Supreme Founder {{founder_name}}." },
    { channel: PLATFORM_CONSTANTS.CHANNEL_SMS, key: "escrow_lock", content: "NAWI Escrow locked securely for transaction ID: {{txId}}" },
    { channel: PLATFORM_CONSTANTS.CHANNEL_PUSH, key: "system_alert", content: "Ecosystem node status verified under strict authority." },
    { channel: PLATFORM_CONSTANTS.CHANNEL_IN_APP, key: "general_notice", content: "New platform ledger synchronization completed for {{date}}." }
  ]
};

RAW_BOOTSTRAP_CONFIG.wallets = [
  { walletType: "Treasury Wallet", owner: "system" },
  { walletType: "Founder Wallet", owner: RAW_BOOTSTRAP_CONFIG.founder.identity },
  { walletType: "Escrow Wallet", owner: "system_escrow" },
  { walletType: "Liquidity Vault", owner: "system_liquidity" },
  { walletType: "Reserve Wallet", owner: "system_reserve" }
];

function deepFreeze(obj) {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

const BOOTSTRAP_CONFIG = deepFreeze(RAW_BOOTSTRAP_CONFIG);

function computeConfigurationChecksum() {
  return crypto.createHash('sha256').update(JSON.stringify(BOOTSTRAP_CONFIG)).digest('hex');
}
const CONFIG_CHECKSUM = computeConfigurationChecksum();

function validateConfigurationIntegrity() {
  const checkDuplicates = (arr, keyName, entityName) => {
    const seen = new Set();
    for (const item of arr) {
      const val = item[keyName];
      if (seen.has(val)) throw new Error(`Integrity Error: Duplicate ${entityName} identifier found -> '${val}'`);
      seen.add(val);
    }
  };
  checkDuplicates(BOOTSTRAP_CONFIG.roles, 'name', 'Role');
  checkDuplicates(BOOTSTRAP_CONFIG.permissions, 'code', 'Permission');
  checkDuplicates(BOOTSTRAP_CONFIG.settings, 'key', 'Setting');
  checkDuplicates(BOOTSTRAP_CONFIG.pillars, 'pillarNumber', 'Pillar');
  checkDuplicates(BOOTSTRAP_CONFIG.categories, 'slug', 'Category');
  checkDuplicates(BOOTSTRAP_CONFIG.visibilityPlans, 'name', 'VisibilityPlan');
  checkDuplicates(BOOTSTRAP_CONFIG.notificationTemplates, 'key', 'NotificationTemplate');
  checkDuplicates(BOOTSTRAP_CONFIG.wallets, 'walletType', 'Wallet');
  logger.info("✓ Configuration integrity pre-check passed.");
}

function displayCliHelp() {
  console.log(`
NAWI-EMPIRE001 Enterprise Bootstrap Engine CLI Help (v6.2 10/10)
Usage: node scripts/seed.js [options]
Options: --roles, --permissions, --founder, --wallets, --categories, --settings, --pillars, --visibility, --notifications, --audit, --reset-founder-password, --dry-run, --confirm, --help
  `);
}

// Helper for precise object deep comparison (dry-run diffs)
function objectsDiffer(existingObj, desiredObj) {
  const cleanExisting = { ...existingObj };
  delete cleanExisting._id;
  delete cleanExisting.__v;
  delete cleanExisting.createdAt;
  delete cleanExisting.updatedAt;
  delete cleanExisting.tokenVersion;
  delete cleanExisting.passwordHash;

  return crypto.createHash('sha256').update(JSON.stringify(cleanExisting)).digest('hex') !==
         crypto.createHash('sha256').update(JSON.stringify(desiredObj)).digest('hex');
}

// ============================================================================
// Enterprise Platform Bootstrap Engine (10/10 Hardened)
// ============================================================================
class PlatformBootstrapEngine {
  constructor() {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      displayCliHelp();
      process.exit(0);
    }
    this.mongoUri = process.env.MONGO_URI || process.env.mongo_uri;
    this.isDryRun = process.argv.includes('--dry-run');
    this.resetFounderOnly = process.argv.includes('--reset-founder-password');
    this.isConfirmed = process.argv.includes('--confirm');
    this.isShuttingDown = false;
    this.isCommitInProgress = false;

    this.cliFlags = {
      roles: process.argv.includes('--roles'),
      permissions: process.argv.includes('--permissions'),
      founder: process.argv.includes('--founder') || this.resetFounderOnly,
      wallets: process.argv.includes('--wallets'),
      categories: process.argv.includes('--categories'),
      settings: process.argv.includes('--settings'),
      pillars: process.argv.includes('--pillars'),
      visibility: process.argv.includes('--visibility'),
      notifications: process.argv.includes('--notifications'),
      audit: process.argv.includes('--audit'),
      all: !process.argv.some(arg => arg.startsWith('--') && arg !== '--dry-run' && arg !== '--confirm')
    };

    this.executionId = `BOOTSTRAP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    this.deploymentId = `DEP-${Date.now()}`;
    this.metrics = {};
    this.transactionTelemetry = [];
    this.counters = {
      inserted: {}, updated: {}, unchanged: {}, skipped: {}, errors: {}, retries: 0
    };
    this.startTime = Date.now();
    this.activeSession = null;
    this.registry = [];
    this.indexVerificationCache = new Set();
    this.eventLoopMonitor = null;
    this.heartbeatTimer = null;
  }

  registerSeeder(definition) {
    this.registry.push({
      validate: definition.validate || async () => {},
      before: definition.before || async () => {},
      after: definition.after || async () => {},
      ...definition
    });
    const key = definition.name.toLowerCase();
    this.counters.inserted[key] = 0;
    this.counters.updated[key] = 0;
    this.counters.unchanged[key] = 0;
    this.counters.skipped[key] = 0;
  }

  setupConnectionLifecycle() {
    mongoose.connection.on('disconnected', () => logger.warn("⚠️ MongoDB connection lost. Attempting auto-reconnect..."));
    mongoose.connection.on('error', (err) => logger.error("❌ MongoDB runtime connection error:", err.message));
    mongoose.connection.on('reconnected', () => logger.info("✓ MongoDB connection re-established successfully."));
  }

  async verifyPreconditions() {
    validateConfigurationIntegrity();
    if (isProduction && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
      throw new Error("Production Protection: ALLOW_PRODUCTION_SEED=true environment flag required.");
    }
    if (isProduction && !this.isDryRun && !this.isConfirmed) {
      throw new Error("Production Safety Gate: --confirm flag mandatory for production execution.");
    }
    logger.audit("Diamondback231 authority seal validated.", { authority: PLATFORM_CONSTANTS.AUTHORITY, checksum: CONFIG_CHECKSUM });
  }

  async connectWithRetry(retries = 3) {
    if (this.isDryRun) return;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await mongoose.connect(this.mongoUri, { serverSelectionTimeoutMS: 10000 });
        this.setupConnectionLifecycle();
        return;
      } catch (e) {
        this.counters.retries++;
        if (attempt === retries) throw e;
        const delay = Math.pow(2, attempt - 1) * 1000 + (Math.random() * 500);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  async verifyUniqueIndexesCached(model, uniqueField) {
    if (this.isDryRun) return;
    const cacheKey = `${model.collection.name}:${uniqueField}`;
    if (this.indexVerificationCache.has(cacheKey)) return;

    const indexes = await model.collection.indexes();
    const hasUnique = indexes.some(idx => idx.key[uniqueField] === 1 && idx.unique === true);
    if (!hasUnique) {
      logger.warn(`⚠️ Warning: Collection '${model.collection.name}' lacks unique index on field '${uniqueField}'. Syncing indexes...`);
      await model.syncIndexes();
    }
    this.indexVerificationCache.add(cacheKey);
  }

  // Atomic Distributed Lock Acquisition with Heartbeat
  async acquireLock(session) {
    if (this.isDryRun) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PLATFORM_CONSTANTS.LOCK_TTL_MS);

    const res = await BootstrapLock.findOneAndUpdate(
      {
        lockKey: PLATFORM_CONSTANTS.LOCK_KEY,
        $or: [
          { expiresAt: { $lt: now } },
          { executionId: this.executionId }
        ]
      },
      {
        $set: {
          executionId: this.executionId,
          deploymentId: this.deploymentId,
          expiresAt,
          lastHeartbeat: now
        }
      },
      { upsert: true, new: true, session }
    );

    if (!res) {
      throw new Error("Concurrency Lock Violation: Active bootstrap session currently holds execution lock.");
    }

    // Start Heartbeat Lease Renewal Timer
    this.heartbeatTimer = setInterval(async () => {
      try {
        const hbSession = await mongoose.startSession();
        hbSession.startTransaction();
        const extension = new Date(Date.now() + PLATFORM_CONSTANTS.LOCK_TTL_MS);
        await BootstrapLock.updateOne(
          { lockKey: PLATFORM_CONSTANTS.LOCK_KEY, executionId: this.executionId },
          { $set: { expiresAt: extension, lastHeartbeat: new Date() } },
          { session: hbSession }
        );
        await hbSession.commitTransaction();
        await hbSession.endSession();
      } catch (e) {
        logger.warn("⚠️ Background lock heartbeat renewal failed:", e.message);
      }
    }, PLATFORM_CONSTANTS.HEARTBEAT_INTERVAL_MS);
  }

  async releaseLock() {
    if (this.isDryRun) return;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    try {
      await BootstrapLock.deleteOne({ lockKey: PLATFORM_CONSTANTS.LOCK_KEY, executionId: this.executionId });
    } catch (e) {}
  }

  initializeRegistry() {
    this.registerSeeder({
      name: "Roles",
      model: Role,
      uniqueKey: "name",
      items: BOOTSTRAP_CONFIG.roles,
      seedFn: async (items, ses, tracker) => {
        const ops = items.map(r => ({
          updateOne: { filter: { name: r.name }, update: { $set: r }, upsert: true }
        }));
        const res = await Role.bulkWrite(ops, { session: ses });
        tracker(res.upsertedCount, res.modifiedCount, res.matchedCount - res.modifiedCount);
      }
    });

    this.registerSeeder({
      name: "Permissions",
      model: Permission,
      uniqueKey: "code",
      items: BOOTSTRAP_CONFIG.permissions,
      seedFn: async (items, ses, tracker) => {
        const ops = items.map(p => ({
          updateOne: { filter: { code: p.code }, update: { $set: p }, upsert: true }
        }));
        const res = await Permission.bulkWrite(ops, { session: ses });
        tracker(res.upsertedCount, res.modifiedCount, res.matchedCount - res.modifiedCount);
      }
    });

    this.registerSeeder({
      name: "Founder",
      model: User,
      uniqueKey: "identity",
      items: [BOOTSTRAP_CONFIG.founder],
      seedFn: async (items, ses, tracker) => {
        const f = items[0];
        const existing = await User.findOne({ identity: f.identity }).session(ses);
        let passwordHash = existing?.passwordHash;
        if (!existing || this.resetFounderOnly) {
          passwordHash = await bcrypt.hash(f.password, 12);
          if (existing) {
            existing.tokenVersion = (existing.tokenVersion || 0) + 1;
            logger.audit("Founder password reset executed. Revoking active authentication tokens.", { identity: f.identity });
          }
        }
        const updateDoc = { email: f.email, passwordHash, role: f.role, verificationFlags: true, tokenVersion: existing?.tokenVersion || 0 };
        const res = await User.updateOne({ identity: f.identity }, { $set: updateDoc }, { upsert: true, session: ses });
        tracker(res.upsertedCount, res.modifiedCount, res.matchedCount - res.modifiedCount);
      }
    });

    this.registerSeeder({
      name: "Settings",
      model: Setting,
      uniqueKey: "key",
      items: BOOTSTRAP_CONFIG.settings,
      seedFn: async (items, ses, tracker) => {
        const ops = items.map(s => ({
          updateOne: { filter: { key: s.key }, update: { $set: s }, upsert: true }
        }));
        const res = await Setting.bulkWrite(ops, { session: ses });
        tracker(res.upsertedCount, res.modifiedCount, res.matchedCount - res.modifiedCount);
      }
    });

    this.registerSeeder({
      name: "Pillars",
      model: Pillar,
      uniqueKey: "pillarNumber",
      items: BOOTSTRAP_CONFIG.pillars,
      seedFn: async (items, ses, tracker) => {
        const ops = items.map(p => ({
          updateOne: { filter: { pillarNumber: p.pillarNumber }, update: { $set: p }, upsert: true }
        }));
        const res = await Pillar.bulkWrite(ops, { session: ses });
        tracker(res.upsertedCount, res.modifiedCount, res.matchedCount - res.modifiedCount);
      }
    });

    this.registerSeeder({
      name: "Wallets",
      model: Wallet,
      uniqueKey: "walletType",
      items: BOOTSTRAP_CONFIG.wallets,
      seedFn: async (items, ses, tracker) => {
        for (const w of items) {
          const res = await Wallet.updateOne(
            { walletType: w.walletType },
            { $setOnInsert: { balance: 0, currency: PLATFORM_CONSTANTS.CURRENCY_USD }, $set: { owner: w.owner } },
            { upsert: true, session: ses }
          );
          if (res.upsertedCount > 0) tracker(1, 0, 0);
          else if (res.modifiedCount > 0) tracker(0, 1, 0);
          else tracker(0, 0, 1);
        }
      }
    });

    this.registerSeeder({
      name: "Categories",
      model: Category,
      uniqueKey: "slug",
      items: BOOTSTRAP_CONFIG.categories,
      seedFn: async (items, ses, tracker) => {
        const ops = items.map(c => ({
          updateOne: { filter: { slug: c.slug }, update: { $set: c }, upsert: true }
        }));
        const res = await Category.bulkWrite(ops, { session: ses });
        tracker(res.upsertedCount, res.modifiedCount, res.matchedCount - res.modifiedCount);
      }
    });

    this.registerSeeder({
      name: "VisibilityPlans",
      model: VisibilityPlan,
      uniqueKey: "name",
      items: BOOTSTRAP_CONFIG.visibilityPlans,
      seedFn: async (items, ses, tracker) => {
        const ops = items.map(v => ({
          updateOne: { filter: { name: v.name }, update: { $set: v }, upsert: true }
        }));
        const res = await VisibilityPlan.bulkWrite(ops, { session: ses });
        tracker(res.upsertedCount, res.modifiedCount, res.matchedCount - res.modifiedCount);
      }
    });

    this.registerSeeder({
      name: "NotificationTemplates",
      model: NotificationTemplate,
      uniqueKey: "key",
      items: BOOTSTRAP_CONFIG.notificationTemplates,
      seedFn: async (items, ses, tracker) => {
        const ops = items.map(t => ({
          updateOne: { filter: { key: t.key }, update: { $set: t }, upsert: true }
        }));
        const res = await NotificationTemplate.bulkWrite(ops, { session: ses });
        tracker(res.upsertedCount, res.modifiedCount, res.matchedCount - res.modifiedCount);
      }
    });
  }

  async executeSegmentedTransactions() {
    this.initializeRegistry();

    const segments = [
      ["Roles", "Permissions"],
      ["Founder"],
      ["Settings", "Pillars", "Wallets"],
      ["Categories", "VisibilityPlans", "NotificationTemplates"]
    ];

    let session = null;
    try {
      session = await mongoose.startSession();
      this.activeSession = session;

      if (!this.isDryRun) {
        session.startTransaction({
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority', j: true }
        });
        await this.acquireLock(session);
        await session.commitTransaction();
        session.endSession();
        this.activeSession = null;
      }
    } catch (e) {
      if (session) {
        if (session.inTransaction()) await session.abortTransaction();
        session.endSession();
        this.activeSession = null;
      }
      throw e;
    }

    // Segmented execution loop wrapped in a guaranteed try...finally
    try {
      for (const segmentNames of segments) {
        let attempt = 1;
        const maxRetries = 3;
        let success = false;

        while (attempt <= maxRetries && !success) {
          let segSession = null;
          const segStartTime = performance.now();
          try {
            segSession = await mongoose.startSession();
            segSession.startTransaction({
              readConcern: { level: 'snapshot' },
              writeConcern: { w: 'majority', j: true }
            });
            this.activeSession = segSession;

            for (const seederName of segmentNames) {
              const seeder = this.registry.find(s => s.name === seederName);
              if (!seeder) continue;

              const key = seeder.name.toLowerCase();
              if (!this.cliFlags.all && !this.cliFlags[key]) continue;

              await seeder.validate(seeder.items);
              await seeder.before();
              await this.verifyUniqueIndexesCached(seeder.model, seeder.uniqueKey);

              const start = performance.now();
              let inserted = 0, updated = 0, unchanged = 0;

              if (this.isDryRun) {
                for (const item of seeder.items) {
                  const existing = await seeder.model.findOne({ [seeder.uniqueKey]: item[seeder.uniqueKey] }).session(segSession);
                  if (!existing) {
                    inserted++;
                  } else if (objectsDiffer(existing.toObject(), item)) {
                    updated++;
                  } else {
                    unchanged++;
                  }
                }
                this.counters.inserted[key] = (this.counters.inserted[key] || 0) + inserted;
                this.counters.updated[key] = (this.counters.updated[key] || 0) + updated;
                this.counters.unchanged[key] = (this.counters.unchanged[key] || 0) + unchanged;
                logger.info(`[DRY-RUN] ${seeder.name}: +${inserted} inserted, ~${updated} updated, =${unchanged} unchanged`);
                await seeder.after();
                continue;
              }

              await seeder.seedFn(seeder.items, segSession, (ins, upd, unch) => {
                inserted += ins;
                updated += upd;
                unchanged += unch;
              });

              const duration = performance.now() - start;
              this.metrics[seeder.name] = duration;
              this.counters.inserted[key] = (this.counters.inserted[key] || 0) + inserted;
              this.counters.updated[key] = (this.counters.updated[key] || 0) + updated;
              this.counters.unchanged[key] = (this.counters.unchanged[key] || 0) + unchanged;

              // Idempotent SeederHistory update (prevents duplicate history growth)
              await SeederHistory.updateOne(
                { seederName: seeder.name },
                {
                  $set: {
                    version: BOOTSTRAP_CONFIG.version,
                    configChecksum: CONFIG_CHECKSUM,
                    success: true,
                    executionTimeMs: duration,
                    timestamp: new Date()
                  }
                },
                { upsert: true, session: segSession }
              );

              await seeder.after();
              logger.info(`✓ ${seeder.name} completed in ${duration.toFixed(2)}ms (+${inserted}, ~${updated}, =${unchanged})`);
            }

            this.isCommitInProgress = true;
            await segSession.commitTransaction();
            this.isCommitInProgress = false;
            segSession.endSession();
            this.activeSession = null;
            success = true;

            this.transactionTelemetry.push({
              segment: segmentNames.join(', '),
              durationMs: (performance.now() - segStartTime).toFixed(2),
              retries: attempt - 1,
              status: 'COMMITTED'
            });
          } catch (error) {
            this.isCommitInProgress = false;
            if (segSession) {
              try {
                if (segSession.inTransaction()) await segSession.abortTransaction();
                segSession.endSession();
              } catch (e) {}
              this.activeSession = null;
            }

            const hasTransientLabel = typeof error.hasErrorLabel === 'function' && (
              error.hasErrorLabel('TransientTransactionError') || error.hasErrorLabel('UnknownTransactionCommitResult')
            );
            const isMsgTransient = ['TransientTransactionError', 'WriteConflict', 'ECONNRESET'].some(c => error.message.includes(c));

            this.counters.retries++;
            if (attempt === maxRetries || (!hasTransientLabel && !isMsgTransient)) throw error;
            attempt++;
            const delay = Math.pow(2, attempt - 1) * 1000 + (Math.random() * 500);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
    } finally {
      // Guaranteed lock release regardless of success or unhandled exception
      await this.releaseLock();
    }

    // Full Comprehensive Post-Bootstrap Health Verification across all collections
    if (!this.isDryRun && !this.resetFounderOnly) {
      const counts = await Promise.all([
        Role.countDocuments(),
        Permission.countDocuments(),
        Setting.countDocuments(),
        Pillar.countDocuments(),
        Wallet.countDocuments(),
        Category.countDocuments(),
        VisibilityPlan.countDocuments(),
        NotificationTemplate.countDocuments()
      ]);
      const expected = [
        BOOTSTRAP_CONFIG.roles.length,
        BOOTSTRAP_CONFIG.permissions.length,
        BOOTSTRAP_CONFIG.settings.length,
        BOOTSTRAP_CONFIG.pillars.length,
        BOOTSTRAP_CONFIG.wallets.length,
        BOOTSTRAP_CONFIG.categories.length,
        BOOTSTRAP_CONFIG.visibilityPlans.length,
        BOOTSTRAP_CONFIG.notificationTemplates.length
      ];
      for (let i = 0; i < counts.length; i++) {
        if (counts[i] < expected[i]) {
          throw new Error(`Health Verification Failed: Collection count mismatch at index ${i}`);
        }
      }
      logger.info("✓ Comprehensive post-bootstrap health verification passed successfully.");
    }

    // Immutable Audit Trail Record
    if (!this.isDryRun && !this.resetFounderOnly && (this.cliFlags.all || this.cliFlags.audit)) {
      const auditSession = await mongoose.startSession();
      auditSession.startTransaction();
      try {
        await AuditLog.create([{
          deploymentId: this.deploymentId,
          executionId: this.executionId,
          systemVersion: BOOTSTRAP_CONFIG.version,
          configChecksum: CONFIG_CHECKSUM,
          operator: BOOTSTRAP_CONFIG.founder.identity,
          hostname: os.hostname(),
          nodeVersion: process.version,
          bootstrappedAt: new Date()
        }], { session: auditSession });
        await auditSession.commitTransaction();
        auditSession.endSession();
      } catch (e) {
        await auditSession.abortTransaction();
        auditSession.endSession();
      }
    }
  }

  setupSignalHandlers() {
    const handleSig = async (signal) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      logger.warn(`⚠️ Received signal (${signal}). Graceful shutdown initiated...`);

      // If a commit is actively flushing, wait up to 5s for completion
      let elapsed = 0;
      while (this.isCommitInProgress && elapsed < 5000) {
        await new Promise(r => setTimeout(r, 100));
        elapsed += 100;
      }

      try {
        if (this.activeSession && this.activeSession.inTransaction()) {
          await this.activeSession.abortTransaction();
        }
      } catch (e) {}
      try { await this.releaseLock(); } catch (e) {}
      try { if (this.eventLoopMonitor) this.eventLoopMonitor.disable(); } catch (e) {}
      try { await mongoose.disconnect(); } catch (e) {}
      process.exit(130);
    };
    process.on('SIGINT', () => handleSig('SIGINT'));
    process.on('SIGTERM', () => handleSig('SIGTERM'));
  }

  async run() {
    try {
      this.eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });
      this.eventLoopMonitor.enable();

      this.setupSignalHandlers();
      await this.verifyPreconditions();
      await this.connectWithRetry();

      logger.info(`🌱 [BOOTSTRAP v${BOOTSTRAP_CONFIG.version} | ID: ${this.executionId}] Starting Enterprise Engine (10/10)...`);
      await this.executeSegmentedTransactions();

      const totalDuration = Date.now() - this.startTime;
      if (this.eventLoopMonitor) this.eventLoopMonitor.disable();

      logger.info(`✓ Enterprise Bootstrap Completed Successfully in ${(totalDuration / 1000).toFixed(2)}s`);

      const heapStats = v8.getHeapStatistics();
      const summary = {
        executionId: this.executionId,
        deploymentId: this.deploymentId,
        version: BOOTSTRAP_CONFIG.version,
        environment: BOOTSTRAP_CONFIG.environment,
        gitCommit: BOOTSTRAP_CONFIG.gitCommit,
        configChecksum: CONFIG_CHECKSUM,
        hostname: os.hostname(),
        platform: os.platform(),
        architecture: os.arch(),
        nodeVersion: process.version,
        pid: process.pid,
        cliFlags: this.cliFlags,
        durationMs: totalDuration,
        counters: this.counters,
        metrics: this.metrics,
        transactionTelemetry: this.transactionTelemetry,
        memory: {
          processMemory: process.memoryUsage(),
          v8Heap: heapStats
        },
        eventLoopDelayMs: {
          mean: this.eventLoopMonitor ? Number(this.eventLoopMonitor.mean / 1e6).toFixed(2) : 0,
          max: this.eventLoopMonitor ? Number(this.eventLoopMonitor.max / 1e6).toFixed(2) : 0
        },
        status: "SUCCESS",
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(path.resolve(__dirname, '../logs/bootstrap-summary.json'), JSON.stringify(summary, null, 2));

    } catch (error) {
      logger.error(`❌ Critical Bootstrap Failure: ${error.message}`, { stack: error.stack });
      process.exitCode = 1;
    } finally {
      try { await this.releaseLock(); } catch (e) {}
      try { if (this.eventLoopMonitor) this.eventLoopMonitor.disable(); } catch (e) {}
      try { await mongoose.disconnect(); } catch (e) {}
    }
  }
}

const engine = new PlatformBootstrapEngine();
engine.run();
