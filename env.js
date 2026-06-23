// =========================================================
// 👑 NAWI-EMPIRE001 - GLOBAL FRONTEND CONTROLLER (env.js)
// CLEAN CROSS-PLATFORM CLIENT RUNTIME ENGINE
// =========================================================

// Dynamic Environment Switcher: Seamlessly switches between local testing and remote web engine
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:10000"
    : "https://nawi-empire1.onrender.com";

/**
 * 🏆 THE GOLDEN ALERT SYSTEM (Notification Bar)
 * Luxury UI Notification Engine for Cross-Device Viewports
 */
function showEmpireAlert(message, type = "success") {
    const existingAlert = document.getElementById('empire-toast');
    if (existingAlert) existingAlert.remove();

    const alertBox = document.createElement('div');
    alertBox.id = "empire-toast";
    
    alertBox.style.cssText = `
        position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
        width: 90%; max-width: 400px; background: rgba(5, 5, 5, 0.98);
        border: 1px solid #D4AF37;
        color: #D4AF37; padding: 18px 25px; border-radius: 15px;
        text-align: center; font-weight: 900; font-size: 11px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.8); z-index: 9999;
        transition: 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        text-transform: uppercase; letter-spacing: 1.5px;
        backdrop-filter: blur(10px);
        font-family: 'Montserrat', 'Inter', sans-serif;
    `;

    let icon = "✨ ";
    if (type === "warning") icon = "⚠️ ";
    if (type === "pillar") icon = "🏛️ ";

    alertBox.innerHTML = `<span>${icon} ${message}</span>`;
    document.body.appendChild(alertBox);

    setTimeout(() => { alertBox.style.top = "25px"; }, 100);

    setTimeout(() => {
        alertBox.style.top = "-120px";
        setTimeout(() => { alertBox.remove(); }, 600);
    }, 5000);
}

/**
 * 🛡️ SOVEREIGN STATUS & BALANCE SYNC
 */
async function syncEmpireData() {
    const userId = localStorage.getItem('user_id');
    const authToken = localStorage.getItem('auth_token'); 
    const identitySignature = localStorage.getItem('nawi_identity'); 

    if (!userId) {
        console.warn("Guest Node Session: Authority Limited.");
        return;
    }

    try {
        // Synchronized cleanly with your exact authRoutes.js endpoints
        const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'user-id': userId,
                'x-nawi-identity': identitySignature || 'GUEST_NODE_ANONYMOUS',
                'x-node-display': `${window.innerWidth}x${window.innerHeight}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error("Session Authenticity Compromised.");
                return;
            }
            throw new Error(`Vault returned server status flag: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "TERMINATED" || data.complianceStatus === "SUSPENDED") {
            window.location.href = "banished.html";
            return;
        }

        if (data.pendingWarning) {
            showEmpireAlert(data.pendingWarning, "warning");
        }

        const coinDisplay = document.getElementById('empire-balance-top');
        if (coinDisplay) {
            const trueCoinBalance = data.balance ? (Number(data.balance) / 100).toFixed(2) : '0.00';
            coinDisplay.innerHTML = `<i class="fa-solid fa-coins"></i> ${trueCoinBalance}`;
        }

        const userName = document.getElementById('nav-user-name');
        if (userName) {
            userName.innerText = data.name || "CITIZEN NODE";
        }

        console.log("Empire Sync Architecture: Operational.");

    } catch (err) {
        console.error("Connection to Vault Lost.", err.message);
    }
}

function initializeNavigation() {
    const toolCards = document.querySelectorAll('.tool-card, [data-tool]');
    toolCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            const target = card.getAttribute('data-tool');
            if (target) {
                window.location.href = `${target}.html`;
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    syncEmpireData();
    initializeNavigation();
    setInterval(syncEmpireData, 60000);
});
