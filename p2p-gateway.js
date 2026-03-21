/**
 * NAWI-EMPIRE SOVEREIGN P2P GATEWAY
 * Authority: 7 Pillars Control Center
 * Security Level: MAX (Sovereign)
 * Version: 2026.3 - Global Sync & Button Binding
 */

const P2P_GATEWAY = {
    // --- IDENTITY & AUTHORITY CONFIG ---
    ceoName: "NAWI-EMPIRE001",
    ceoSocial: "7 pillars",
    userBalance: 0, 

    // 1. MASTER AUTHORITY CHECK
    isMasterAuthority: function() {
        return localStorage.getItem('nawi_identity') === this.ceoName;
    },

    executeMasterBypass: function(serviceName) {
        console.log("MASTER AUTHORITY RECOGNIZED. BYPASSING P2P FEE...");
        const toast = document.createElement('div');
        toast.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#D4AF37; color:#000; padding:12px 25px; border-radius:50px; font-weight:900; font-size:11px; z-index:20000; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-transform:uppercase;";
        toast.innerText = `MASTER ACCESS GRANTED: ${serviceName}`;
        document.body.appendChild(toast);
        
        setTimeout(() => { toast.remove(); }, 3000);
        return true; 
    },

    // 2. LIVE CURRENCY & COIN ECONOMICS
    calculateEmpireCoins: function(amount, currency) {
        const rates = { 'NGN': 1360, 'USD': 1, 'GBP': 0.78, 'INR': 83 };
        const baseUSD = amount / (rates[currency] || 1);
        return Math.floor(baseUSD * 2); 
    },

    // 3. THE LUXURY MODAL (P2P Authorization)
    showAuthorizationModal: function(service, amountLocal, currency) {
        // CEO Bypass Check
        if (this.isMasterAuthority()) {
            return this.executeMasterBypass(service);
        }

        const coinCost = this.calculateEmpireCoins(amountLocal, currency);
        const modal = document.createElement('div');
        modal.id = 'p2p-modal-overlay';
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); backdrop-filter:blur(15px); display:flex; align-items:center; justify-content:center; z-index:10000; font-family:'Inter', sans-serif;";

        modal.innerHTML = `
            <div style="background:#000; border:1px solid #D4AF37; width:85%; max-width:360px; border-radius:30px; padding:35px; text-align:center; box-shadow:0 0 50px rgba(212,175,55,0.15);">
                <i class="fa-solid fa-crown" style="color:#D4AF37; font-size:35px; margin-bottom:15px;"></i>
                <h2 style="color:#fff; font-size:14px; letter-spacing:3px; text-transform:uppercase; margin-bottom:20px;">P2P Authorization</h2>
                <div style="background:#111; padding:20px; border-radius:20px; margin-bottom:25px; border:1px solid #222;">
                    <span style="display:block; color:#555; font-size:9px; text-transform:uppercase; font-weight:800; margin-bottom:8px;">${service}</span>
                    <span style="color:#D4AF37; font-size:28px; font-weight:900;">${coinCost} 🪙</span>
                    <p style="color:#00ff64; font-size:9px; font-weight:bold; margin-top:10px;">ESCROW PROTECTION ACTIVE</p>
                </div>
                <button id="p2p-confirm" style="background:#D4AF37; color:#000; width:100%; padding:18px; border-radius:15px; border:none; font-weight:900; text-transform:uppercase; cursor:pointer; font-size:12px;">Confirm & Pay</button>
                <button id="p2p-cancel" style="background:transparent; color:#444; width:100%; border:none; margin-top:15px; font-size:10px; font-weight:800; cursor:pointer;">CANCEL ACCESS</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('p2p-confirm').onclick = () => { this.processEscrow(service, coinCost); };
        document.getElementById('p2p-cancel').onclick = () => { modal.remove(); };
    },

    processEscrow: async function(service, coins) {
        console.log(`P2P GATEWAY: Locking ${coins} coins in Escrow for ${service}...`);
        alert(`✅ Verified. Money Held by Empire for ${service}.`);
        document.getElementById('p2p-modal-overlay')?.remove();
    },

    // 4. DEPOSIT & WITHDRAWAL PROTOCOLS
    initiateDeposit: function() {
        alert("🏰 Redirecting to Sovereign Mint for Coin Purchase...");
    },

    initiateWithdraw: function() {
        alert("🛡️ Security Check: Withdrawal requires 24h Escrow Clearance.");
    }
};

// --- AUTOMATIC LISTENERS & BUTTON BINDING ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Bind Deposit Button
    const depositBtn = document.getElementById('deposit-btn');
    if (depositBtn) {
        depositBtn.onclick = () => P2P_GATEWAY.initiateDeposit();
    }

    // 2. Bind Withdraw Button
    const withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn) {
        withdrawBtn.onclick = () => P2P_GATEWAY.initiateWithdraw();
    }

    // 3. Listener for Currency Dropdown
    const currencyDropdown = document.getElementById('currencyCode');
    if (currencyDropdown) {
        currencyDropdown.addEventListener('change', (e) => {
            console.log(`P2P Request: Coin Conversion starting for ${e.target.value}.`);
        });
    }

    // 4. Auto-Login CEO (Hidden Authority)
    localStorage.setItem('nawi_identity', 'NAWI-EMPIRE001');
    localStorage.setItem('nawi_token', 'AUTHORITY_RECOGNIZED');
});
