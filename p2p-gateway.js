/**
 * NAWI-EMPIRE Universal P2P Gateway
 * Authority: 7 Pillars Control Center
 * MASTER BYPASS ENABLED FOR CEO
 */

const P2P_GATEWAY = {
    // Current user balance
    userBalance: 1500,
    
    // CEO IDENTITY CONFIG
    ceoName: "NAWI-EMPIRE001",
    ceoSocial: "7 pillars",

    // Function to start a transaction
    initiateTransaction: function(serviceName, amount) {
        console.log(`P2P Request: ${serviceName} | Cost: ${amount}`);
        
        // CHECK FOR MASTER AUTHORITY (CEO Bypass)
        // If the user is the Master, they don't pay.
        if (this.isMasterAuthority()) {
            this.executeMasterBypass(serviceName);
            return;
        }

        this.showModal(serviceName, amount);
    },

    // Check if the current user is the CEO
    isMasterAuthority: function() {
        // This looks at the local storage to see if the Master is logged in
        const currentIdentity = localStorage.getItem('nawi_identity');
        return currentIdentity === this.ceoName;
    },

    executeMasterBypass: function(service) {
        console.log("Master Authority Recognized. Bypassing P2P Fee...");
        // For the Master, we just show a quick toast and unlock
        const toast = document.createElement('div');
        toast.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#D4AF37; color:#000; padding:12px 25px; border-radius:50px; font-weight:900; font-size:12px; z-index:20000; box-shadow:0 10px 30px rgba(0,0,0,0.5);";
        toast.innerText = `MASTER ACCESS GRANTED: ${service.toUpperCase()}`;
        document.body.appendChild(toast);
        
        setTimeout(() => { 
            toast.remove();
            // If it's a music track, it will play. If it's a menu item, it will order.
            // For now, we confirm the action is free.
        }, 2000);
    },

    // Create and show the Luxury Authority Modal for normal citizens
    showModal: function(service, cost) {
        this.closeModal();

        const modal = document.createElement('div');
        modal.id = 'p2p-modal-overlay';
        
        const style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.98); backdrop-filter: blur(15px);
            display: flex; align-items: center; justify-content: center; z-index: 10000;
            font-family: 'Inter', sans-serif;
        `;
        modal.setAttribute('style', style);

        modal.innerHTML = `
            <div style="background: #000; border: 1px solid #D4AF37; width: 85%; max-width: 380px; border-radius: 30px; padding: 40px 30px; text-align: center;">
                <i class="fa-solid fa-crown" style="color: #D4AF37; font-size: 40px; margin-bottom: 20px;"></i>
                <h2 style="color: #fff; font-size: 16px; margin: 0; letter-spacing: 3px; font-weight: 900; text-transform: uppercase;">P2P Authorization</h2>
                
                <div style="background: #111; padding: 25px; border-radius: 20px; margin: 25px 0; border: 1px solid #222;">
                    <span style="display: block; color: #555; font-size: 9px; text-transform: uppercase; font-weight: 800; margin-bottom: 10px;">Network Service: ${service}</span>
                    <span style="color: #D4AF37; font-size: 32px; font-weight: 900;">${cost} 🪙</span>
                </div>

                <button id="p2p-confirm-btn" style="background: #D4AF37; color: #000; width: 100%; padding: 20px; border-radius: 15px; border: none; font-weight: 900; text-transform: uppercase; cursor: pointer; margin-bottom: 15px; font-size: 12px;">Confirm Transaction</button>
                <button id="p2p-cancel-btn" style="background: transparent; color: #444; width: 100%; border: none; font-size: 10px; font-weight: 800; cursor: pointer;">CANCEL ACCESS</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('p2p-confirm-btn').onclick = () => { this.processPayment(service, cost); };
        document.getElementById('p2p-cancel-btn').onclick = () => { this.closeModal(); };
    },

    processPayment: function(service, price) {
        if (this.userBalance >= price) {
            this.userBalance -= price;
            alert(`✅ Verified. ${service} Unlocked.`);
            this.closeModal();
            // You can add logic here to trigger music play or menu orders
        } else {
            alert('❌ Insufficient Coins.');
        }
    },

    closeModal: function() {
        const modal = document.getElementById('p2p-modal-overlay');
        if (modal) modal.remove();
    }
};

// INITIALIZE MASTER LOGIN (Run this once on your device to be recognized as CEO)
function setMasterAccess() {
    localStorage.setItem('nawi_identity', 'NAWI-EMPIRE001');
    localStorage.setItem('nawi_token', 'AUTHORITY_RECOGNIZED');
    console.log("CEO Authority Logged In.");
}

// Automatically log you in as Master for this session
setMasterAccess();
