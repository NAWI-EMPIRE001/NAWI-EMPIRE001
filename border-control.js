const User = require('./models/User'); // Maps to NAWI_DB.users
const Message = require('./models/Message'); // Maps to NAWI_DB.messages / inbox
const ComplianceVault = require('./models/ComplianceVault'); // Maps to NAWI_DB.compliancevaults
const DailyLedger = require('./models/DailyLedger'); // Maps to NAWI_DB.dailyledgers

// SOVEREIGN BYPASS CONSTANTS
const SOVEREIGN_ID = "NAWI-EMPIRE001"; // Your Master Admin ID
const MASTER_PASS_NAME = "7 pillars";   // Your Social Media Authority Name

// LEACHING PREVENTION CONSTANTS
const BLACKLISTED_PLATFORMS = ["whatsapp", "telegram", "ig", "instagram", "facebook", "snapchat", "number", "+234"];
const REPUTATION_LOCK_THRESHOLD = 50; // Wallets freeze if reputation falls below 50
const MAX_VIOLATION_LIMIT = 3;         // Wallets freeze at 3 off-platform platform attempts

/**
 * CODE 1 FEATURE: IMPERIAL CHAT FILTER & LEAK ENGINE
 * Scans messages for external platform links, logs penalties, and applies the "Mirror" spoofing layer.
 */
exports.processIncomingChatMessage = async (req, res) => {
    try {
        const { senderId, receiverId, messageContent } = req.body;

        // 1. SOVEREIGN BYPASS: Master control account is immune to chat scans and blacklists
        if (senderId === SOVEREIGN_ID) {
            const savedMsg = new Message({
                senderId,
                recipientId: receiverId,
                text: messageContent,
                type: "DIRECT_MESSAGE",
                timestamp: new Date()
            });
            await savedMsg.save();

            return res.status(200).json({
                success: true,
                status: "DELIVERED",
                message: "Sovereign communication routed cleanly without filter checks."
            });
        }

        // 2. Scan content for unauthorized platform communication extraction attempts
        const isTryingToExit = BLACKLISTED_PLATFORMS.some(platform => 
            messageContent.toLowerCase().includes(platform)
        );

        if (isTryingToExit) {
            // Apply real-time reputation score deductions to the offender
            await User.findByIdAndUpdate(senderId, { 
                $inc: { violationCount: 1, reputationScore: -15 } 
            });

            // Trigger the "Mirror" Trick: The sender receives a visual confirmation message spoof
            return res.status(200).json({ 
                success: true,
                status: "SPOOFED", 
                messageContent: messageContent, // Sender thinks it went through
                warning: "Imperial Security has flagged this transmission. Taking users off-platform is an infrastructure violation." 
            });
        }

        // 3. If clean, save the standard operational message to the database collection
        const standardMsg = new Message({
            senderId,
            recipientId: receiverId,
            text: messageContent,
            type: "DIRECT_MESSAGE",
            timestamp: new Date()
        });
        await standardMsg.save();

        return res.status(200).json({
            success: true,
            status: "DELIVERED"
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * CODE 2 FEATURE: GLOBAL COMPLIANCE EVALUATOR
 * Assesses localization document parameters, tracks the hidden $35 ledger layer, and checks for chat filters locks.
 */
exports.evaluateBorderControl = async (req, res) => {
    try {
        const { userId, countryCode } = req.body; // e.g., 'NG', 'US', 'GB', 'ZA'
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. SOVEREIGN BYPASS CHECK: Structural access bypass across all checkpoints
        if (userId === SOVEREIGN_ID) {
            return res.status(200).json({
                success: true,
                message: `Sovereign clearance verified. Access granted to [${MASTER_PASS_NAME}].`,
                gate_status: "PASSED",
                bypass_active: true
            });
        }

        // 2. Fetch User parameters
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Profile missing from Empire records." });

        // INTEGRATION CRITICAL LINK: Cross-reference user chat violation state before checking documents
        if (user.reputationScore < REPUTATION_LOCK_THRESHOLD || user.violationCount >= MAX_VIOLATION_LIMIT) {
            return res.status(403).json({
                success: false,
                message: "Financial pipeline FROZEN due to platform community violations and low reputation rank.",
                gate_status: "TERMINATED",
                violations: user.violationCount,
                reputation: user.reputationScore
            });
        }

        // 3. SILENT BACKEND LEDGER CHECK (The Hidden $35 Layer)
        let ledger = await DailyLedger.findOne({ date: todayStr });
        if (ledger && user.tier === 'Professional') {
            if (!user.infrastructure_validated) {
                ledger.totalVolumeProcessedUsd += 35;
                await ledger.save();
                user.infrastructure_validated = true; 
                await user.save();
            }
        }

        // 4. CHECK ARCHIVE FOR COMPLIANCE VERIFICATION APPROVALS
        const existingCompliance = await ComplianceVault.findOne({ userId });
        if (existingCompliance && existingCompliance.status === 'APPROVED') {
            return res.status(200).json({
                success: true,
                message: "Compliance cleared. Gate open.",
                gate_status: "PASSED"
            });
        }

        // 5. GLOBAL GATEWAY RUNTIMES: Adapt document requirements dynamically to any country worldwide
        let requiredDocs = [];
        const normalizedCountry = countryCode ? countryCode.toUpperCase() : 'GLOBAL';

        switch (normalizedCountry) {
            case 'NG':
                requiredDocs = [
                    { doc_type: "GOVT_ID", label: "National ID, NIMC, or Voters Card" },
                    { doc_type: "BUSINESS_REG", label: "CAC Registration Documents (For Businesses/Chefs)" }
                ];
                break;
            case 'US':
                requiredDocs = [
                    { doc_type: "GOVT_ID", label: "State Driver's License or US Passport" },
                    { doc_type: "BUSINESS_REG", label: "LLC Articles of Organization or EIN Letter" }
                ];
                break;
            case 'GB':
                requiredDocs = [
                    { doc_type: "GOVT_ID", label: "UK Passport or Residence Card" },
                    { doc_type: "BUSINESS_REG", label: "Companies House Registration Certificate" }
                ];
                break;
            default:
                requiredDocs = [
                    { doc_type: "GOVT_ID", label: "Valid International Passport or National Identity Card" },
                    { doc_type: "BUSINESS_REG", label: "Local Corporate Registry or Tax Identification Document (Optional)" }
                ];
                break;
        }

        return res.status(403).json({
            success: false,
            message: "Identity and Compliance validation required to unlock global payouts.",
            gate_status: "LOCKED",
            country_detected: normalizedCountry,
            requirements: requiredDocs
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * SECURE COMPLIANCE VAULT INSULATION
 * Streams incoming registration uploads safely to the target database model.
 */
exports.submitComplianceDocuments = async (req, res) => {
    try {
        const { userId, countryCode, documentUrls, businessName } = req.body;

        let vaultRecord = await ComplianceVault.findOne({ userId });

        if (!vaultRecord) {
            vaultRecord = new ComplianceVault({
                userId,
                countryCode: countryCode.toUpperCase(),
                businessName: businessName || "Individual Citizen Portfolio",
                submittedDocuments: documentUrls,
                status: 'PENDING',
                submissionDate: new Date()
            });
        } else {
            vaultRecord.submittedDocuments = documentUrls;
            vaultRecord.status = 'PENDING';
            vaultRecord.submissionDate = new Date();
        }

        await vaultRecord.save();

        return res.status(200).json({
            success: true,
            message: "Documents securely locked into the Compliance Vault. Review initiated.",
            status: "PENDING"
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
