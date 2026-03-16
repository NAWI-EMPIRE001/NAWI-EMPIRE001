/**
 * NAWI-EMPIRE Universal P2P Gateway
 * Authority: 7 Pillars Control Center
 * Logic: Combines Luxury Design with Functional Transaction Processing
 */

const P2P_GATEWAY = {
    // Current user balance (Static for now, syncs with DB later)
    userBalance: 1500,

    // Function to start a transaction
    initiateTransaction: function(serviceName, amount) {
        console.log(`P2P Request: ${serviceName} | Cost: ${amount}`);
        this.showModal(serviceName, amount);
    },

    // Create and show the Luxury Authority Modal
    showModal: function(service, cost) {
        // Remove existing modal if it exists to prevent duplicates
        this.closeModal();

        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'p2p-modal-overlay';
        
        // Modal Styling (Premium Glass-morphism)
        const style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); backdrop-filter: blur(15px);
            display: flex; align-items: center; justify-content: center; z-index: 10000;
            font-family: 'Inter', sans-serif;
        `;
        modal.setAttribute('style', style);

        modal.innerHTML = `
            <div style="background: #111; border: 1px solid #D4AF37; width: 85%; max-width: 380px; border-radius: 28px; padding: 35px; text-align: center; box-shadow: 0 0 40px rgba(212,175,55,0.15);">
                <i class="fa-solid fa-shield-halved" style="color: #D4AF37; font-size: 45px; margin-bottom: 20px;"></i>
                <h2 style="color: #fff; font-size: 18px; margin: 0; letter-spacing: 3px; font-weight: 900; text-transform: uppercase;">Authorize P2P</h2>
                <p style="color: #888; font-size: 11px; margin: 10px 0 25px; text-transform: uppercase; letter-spacing: 1px;">Authority: 7 Pillars Control</p>
                
                <div style="background: #000; padding: 25px; border-radius: 20px; margin-bottom: 25px; border: 1px dashed #333;">
                    <span style="display: block; color: #666; font-size: 10px; text-transform: uppercase; font-weight: 800; margin-bottom: 8px;">Service: ${service}</span>
                    <span style="color: #D4AF37; font-size: 28px; font-weight: 900;">${cost} 🪙</span>
                </div>

                <button id="p2p-confirm-btn" style="background: #D4AF37; color: #000; width: 100%; padding: 18px; border-radius: 15px; border: none; font-weight: 900; text-transform: uppercase; cursor: pointer; margin-bottom: 15px; font-size: 12px; letter-spacing: 1px;">Authorize Transfer</button>
                <button id="p2p-cancel-btn" style="background: transparent; color: #555; width: 100%; border: none; font-size: 11px; font-weight: 700; cursor: pointer;">DECLINE TRANSACTION</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Logic for Confirmation
        document.getElementById('p2p-confirm-btn').onclick = () => {
            this.processPayment(service, cost);
        };

        // Logic for Cancellation
        document.getElementById('p2p-cancel-btn').onclick = () => {
            this.closeModal();
        };
    },

    processPayment: function(service, price) {
        if (this.userBalance >= price) {
            this.userBalance -= price;
            
            // Professional Success Alert
            alert(`✅ Transaction Verified. \n\n${service} has been activated. Details sent to your Inbox.`);
            
            this.closeModal();
            
            // Redirect to Inbox as requested in original logic
            window.location.href = 'inbox.html';
        } else {
            alert('❌ Insufficient Empire Coins. \n\nPlease top up at the Headquarters to continue.');
        }
    },

    closeModal: function() {
        const modal = document.getElementById('p2p-modal-overlay');
        if (modal) modal.remove();
    }
};
