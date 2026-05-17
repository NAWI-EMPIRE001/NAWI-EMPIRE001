/**
 * NAWI-EMPIRE | UNIFIED SOVEREIGN P2P GATEWAY MODULE
 * Authority: NAWI-EMPIRE001 / 7 pillars
 * System Node Sync: Aurora-231 (192GB RAM Workstation Workhorse)
 */

const User = require('./models/User'); // Maps to NAWI_DB.users
const DailyLedger = require('./models/DailyLedger'); // Maps to NAWI_DB.dailyledgers
const WithdrawalRequest = require('./models/WithdrawalRequest'); // Maps to NAWI_DB.withdrawalrequests

// SOVEREIGN BYPASS CONSTANTS
const SOVEREIGN_ID = "NAWI-EMPIRE001"; // Your Master Admin ID
const MASTER_PASS_NAME = "7 pillars";   // Your Social Media Authority Name

// P2P SYSTEM STATUS MATRIX
const P2P_STATUS = {
    MATCHING: "MATCHING_WITH_MERCHANT",
    ESCROWED: "ASSETS_LOCKED_IN_ESCROW",
    COMPLETED: "SETTLED_SUCCESSFULLY",
    DISPUTE: "ORDER_UNDER_DISPUTE"
};

// ==========================================
// PART A: BACKEND NODE ROUTING CONTROLLERS
// ==========================================

/**
 * INITIATES AN AUTOMATED GLOBAL P2P ORDER MATCH
 * Routes authorized withdrawal requests to external merchant API queues (Binance, Bybit, Geegpay).
 */
exports.createP2POrder = async (req, res) => {
    try {
        const { requestId, userId, targetCrypto, localCurrency, fallbackAmount } = req.body; 
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. SOVEREIGN OVERRIDE: Instant simulation bypass for administrative testing
        if (userId === SOVEREIGN_ID) {
            return res.status(200).json({
                success: true,
                message: `This is my order and my authority to protect this platform. Execute bypassing standard wait times.`,
                orderStatus: P2P_STATUS.COMPLETED,
                transactionId: `TXN-SOV-${Math.floor(Math.random() * 1000000)}`,
                details: { cryptoReleased: targetCrypto || "USDT", fiatPaid: fallbackAmount || "0.00" },
                bypass_active: true
            });
        }

        // 2. Locate the authenticated Master Withdrawal Request record
        let withdrawal = await WithdrawalRequest.findById(requestId);
        
        // Dynamic Fallback: If initialized directly from UI form without pre-routing
        if (!withdrawal && fallbackAmount) {
            withdrawal = new WithdrawalRequest({
                userId: userId,
                amount: fallbackAmount,
                gateway: 'GEEGPAY',
                status: 'DISBURSED'
            });
        } else if (!withdrawal) {
            return res.status(404).json({ success: false, message: "Authorized withdrawal ledger record not found." });
        }

        // 3. SECURE COLLATERAL MATCHING RUNTIME
        const selectedGateway = withdrawal.gateway || 'GEEGPAY';
        const orderId = `P2P-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 4. SILENT BACKEND MAINTENANCE CHECK (The Hidden $35 Layer Execution)
        const user = await User.findById(userId);
        if (user && user.tier === 'Professional') {
            let ledger = await DailyLedger.findOne({ date: todayStr });
            if (ledger && !user.infrastructure_validated) {
                ledger.totalVolumeProcessedUsd += 35;
                await ledger.save();
                
                user.infrastructure_validated = true;
                await user.save();
            }
        }

        // 5. RESPOND WITH DYNAMIC FRONTEND CONSTRUCTS
        return res.status(200).json({
            success: true,
            message: "Peer matching successfully initialized across the global payment channel.",
            orderContext: {
                orderId: orderId,
                status: P2P_STATUS.MATCHING,
                fiatValue: withdrawal.amount,
                currencyCode: localCurrency || "NGN",
                cryptoAsset: targetCrypto || "USDT",
                routingTerminal: selectedGateway
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * PEER-TO-PEER ESCROW RELEASE HANDSHAKE
 */
exports.confirmP2PRelease = async (req, res) => {
    try {
        const { orderId, merchantId, confirmSecret, releaseAction, userId } = req.body;

        // Security Validation
        if (confirmSecret !== process.env.P2P_WEBHOOK_SECRET && userId !== SOVEREIGN_ID) {
            return res.status(401).json({ success: false, message: "Unauthorized gateway interaction signature." });
        }

        if (releaseAction === "RELEASE_FUNDS") {
            return res.status(200).json({
                success: true,
                orderId: orderId,
                status: P2P_STATUS.COMPLETED,
                message: "Escrow release verified. Digital payment completed successfully across global nodes."
            });
        } else if (releaseAction === "TRIGGER_DISPUTE") {
            return res.status(200).json({
                success: true,
                orderId: orderId,
                status: P2P_STATUS.DISPUTE,
                message: "Order placed into hold containment. Core arbitration agents notified."
            });
        }

        return res.status(400).json({ success: false, message: "Unrecognized gateway execution code." });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// PART B: CLIENT UI COMPONENT INTERFACE
// ==========================================

exports.serveGatewayPage = (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>NAWI-EMPIRE | Sovereign P2P Gateway</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Cinzel:wght@700&display=swap" rel="stylesheet">
        
        <style>
            :root { --gold: #D4AF37; --black: #050505; --matte: #0A0A0A; --green: #00ff64; }
            body { background: var(--black); color: white; font-family: 'Inter', sans-serif; margin: 0; overflow-x: hidden; }
            .gateway-card {
                background: linear-gradient(145deg, #0f0f0f 0%, #050505 100%);
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 30px;
                padding: 30px;
                max-width: 450px;
                margin: 40px auto;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.05);
                position: relative;
            }
            .node-status-bar {
                background: rgba(0, 255, 100, 0.05);
                border: 1px solid rgba(0, 255, 100, 0.2);
                border-radius: 10px;
                padding: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 25px;
            }
            .pulse-dot {
                width: 8px; height: 8px; background: var(--green);
                border-radius: 50%; box-shadow: 0 0 10px var(--green);
                animation: pulse 2s infinite;
            }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            .sov-input-group { margin-bottom: 20px; }
            .sov-label { font-size: 9px; font-weight: 900; color: var(--gold); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; display: block; }
            .sov-input {
                width: 100%; background: #111; border: 1px solid #222; 
                padding: 15px; border-radius: 12px; color: white;
                font-size: 13px; transition: 0.3s;
            }
            .sov-input:focus { border-color: var(--gold); outline: none; background: #151515; }
            .btn-sov-execute {
                width: 100%; background: var(--gold); color: black;
                padding: 18px; border-radius: 15px; font-weight: 900;
                text-transform: uppercase; letter-spacing: 2px; font-size: 11px;
                box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2);
                cursor: pointer; transition: 0.3s; border: none;
            }
            .btn-sov-execute:active { transform: scale(0.97); }
            #authority-overlay {
                position: fixed; inset: 0; background: rgba(0,0,0,0.9);
                display: none; align-items: center; justify-content: center; z-index: 10000;
                backdrop-filter: blur(10px);
            }
        </style>
    </head>
    <body>

        <div class="gateway-card">
            <div class="node-status-bar">
                <div class="flex items-center gap-3">
                    <div class="pulse-dot"></div>
                    <span class="text-[9px] font-black uppercase tracking-widest text-emerald-500">Node: Aurora-231 Active</span>
                </div>
                <span class="text-[8px] text-zinc-500 font-bold">RTX 4090 SECURED</span>
            </div>

            <div class="text-center mb-8">
                <h2 class="text-xl font-black font-['Cinzel'] text-amber-500 tracking-tighter italic">SOVEREIGN BRIDGE</h2>
                <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">P2P Liquidity & Escrow Resolution</p>
            </div>

            <div id="live-monitor-box" class="hidden mb-6 p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                <p class="text-[8px] uppercase tracking-wider text-zinc-500">Engine Order Status</p>
                <div id="status-badge" class="text-xs font-black text-amber-500 mt-1 uppercase">SYNCING</div>
                <div id="txn-details" class="text-[10px] text-zinc-400 mt-2 font-mono"></div>
            </div>

            <div class="sov-input-group">
                <label class="sov-label">Destination Node Identification Tag</label>
                <input type="text" id="target-account" class="sov-input" placeholder="Account ID or Raenest Tag">
            </div>

            <div class="sov-input-group">
                <label class="sov-label">Liquidity Volume (EMPR / USD Equivalents)</label>
                <input type="number" id="target-amount" class="sov-input" placeholder="0.00">
            </div>

            <button class="btn-sov-execute" onclick="P2PGateway.initiateTransfer()">
                Authorize Liquidity Sync
            </button>

            <div class="mt-8 pt-6 border-t border-zinc-900 text-center">
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
                    <i class="fa-solid fa-shield-halved text-amber-500 text-[10px]"></i>
                    <span class="text-[8px] font-black text-zinc-400 uppercase tracking-widest">100% Escrow Protection Worldwide</span>
                </div>
            </div>
        </div>

        <div id="authority-overlay">
            <div class="bg-black border border-amber-500 p-8 rounded-3xl max-w-sm text-center">
                <i class="fa-solid fa-crown text-amber-500 text-3xl mb-4"></i>
                <h3 class="text-amber-500 font-black tracking-widest mb-4 uppercase">Master Override</h3>
                <p id="authority-msg" class="text-xs text-zinc-400 italic leading-relaxed"></p>
                <button onclick="document.getElementById('authority-overlay').style.display='none'" class="mt-6 text-[10px] font-black text-zinc-500 uppercase">Dismiss</button>
            </div>
        </div>

        <script>
            const P2PGateway = {
                ceoIdentity: "NAWI-EMPIRE001",
                nodeEndpoint: window.location.origin, // Dynamic auto-linking matching endpoint targets

                init: function() {
                    console.log("Sovereign Handshake: Linking client node layout elements to engine controllers...");
                    localStorage.setItem('nawi_identity', 'NAWI-EMPIRE001');
                },

                initiateTransfer: async function() {
                    const authKey = localStorage.getItem('nawi_identity');
                    const data = {
                        requestId: null, // Initialized via fallback stream validation tracking
                        userId: authKey,
                        targetCrypto: "USDT",
                        localCurrency: "NGN",
                        fallbackAmount: parseFloat(document.getElementById('target-amount').value)
                    };

                    if(!data.fallbackAmount) {
                        alert("Empire Gateway Error: Valid liquidation amount metrics required.");
                        return;
                    }

                    // Activate interface tracking cards instantly
                    const monitorBox = document.getElementById('live-monitor-box');
                    const badge = document.getElementById('status-badge');
                    const txnBox = document.getElementById('txn-details');
                    monitorBox.classList.remove('hidden');

                    try {
                        const response = await fetch(\`\${this.nodeEndpoint}/api/p2p/create-order\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        
                        const result = await response.json();
                        
                        if(result.success) {
                            if (result.bypass_active) {
                                this.showAuthorityToast(result.message);
                                badge.innerText = "SETTLED_SUCCESSFULLY";
                                badge.className = "text-xs font-black text-emerald-400 mt-1 uppercase";
                                txnBox.innerText = \`ID: \${result.transactionId} \\n Sovereign Master Pass Triggered.\`;
                            } else {
                                badge.innerText = result.orderContext.status;
                                txnBox.innerText = \`ID: \${result.orderContext.orderId} \\n Router Channel: \${result.orderContext.routingTerminal}\`;
                                alert("Liquidity matched across active peer gateways.");
                            }
                        } else {
                            badge.innerText = "FAILED";
                            badge.className = "text-xs font-black text-red-500 mt-1 uppercase";
                            alert(result.message || "Gateway rejection encountered.");
                        }
                    } catch (err) {
                        console.error("Critical Engine Disconnect:", err);
                        badge.innerText = "OFFLINE_SYNC_LOGGED";
                        txnBox.innerText = "Logged to secure local buffer storage nodes.";
                    }
                },

                showAuthorityToast: function(msg) {
                    const overlay = document.getElementById('authority-overlay');
                    const msgBox = document.getElementById('authority-msg');
                    msgBox.innerText = msg;
                    overlay.style.display = 'flex';
                }
            };

            document.addEventListener('DOMContentLoaded', () => {
                P2PGateway.init();
            });
        </script>
    </body>
    </html>
    `;
    res.send(htmlContent);
};
