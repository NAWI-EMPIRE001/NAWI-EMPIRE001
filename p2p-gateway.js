/**
 * NAWI-EMPIRE Universal P2P Gateway
 * Authority: 7 Pillars Control Center
 */

const P2P_GATEWAY = {
    // Current user balance (This would eventually sync with your Database)
    userBalance: 1500,

    // Function to create and show the P2P Modal
    initiateTransaction: function(itemName, price) {
        // Create the modal HTML structure if it doesn't exist
        if (!document.getElementById('p2p-modal-container')) {
            this.createModal();
        }

        // Update modal details
        document.getElementById('p2p-item-name').innerText = itemName;
        document.getElementById('p2p-item-price').innerText = price;
        
        // Show the modal
        document.getElementById('p2p-modal-container').style.display = 'flex';
    },

    createModal: function() {
        const modalHtml = `
            <div id="p2p-modal-container" style="display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.95); backdrop-filter:blur(10px); align-items:center; justify-content:center;">
                <div style="background:#111; padding:30px; border:1px solid #D4AF37; width:85%; max-width:400px; border-radius:24px; text-align:center; font-family:'Inter', sans-serif;">
                    <i class="fa-solid fa-shield-halved" style="color:#D4AF37; font-size:40px; margin-bottom:15px;"></i>
                    <h2 style="color:#D4AF37; margin:0 0 10px; font-size:20px; text-transform:uppercase; letter-spacing:2px;">P2P Verification</h2>
                    <p style="color:#888; font-size:12px;">Merchant: 7 Pillars Authority</p>
                    
                    <div style="background:#000; border:1px dashed #333; padding:20px; border-radius:15px; margin:20px 0;">
                        <div id="p2p-item-name" style="color:#fff; font-weight:900; font-size:16px; margin-bottom:5px;"></div>
                        <div style="color:#D4AF37; font-size:22px; font-weight:900;"><span id="p2p-item-price"></span> 🪙</div>
                    </div>

                    <button id="p2p-confirm-btn" onclick="P2P_GATEWAY.processPayment()" style="background:#D4AF37; color:#000; border:none; padding:16px; width:100%; border-radius:12px; font-weight:900; cursor:pointer; text-transform:uppercase; font-size:12px; letter-spacing:1px; margin-bottom:15px;">Authorize Transfer</button>
                    <button onclick="P2P_GATEWAY.closeModal()" style="background:none; border:none; color:#555; cursor:pointer; font-size:12px; font-weight:bold;">Cancel Transaction</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    closeModal: function() {
        document.getElementById('p2p-modal-container').style.display = 'none';
    },

    processPayment: function() {
        const price = parseInt(document.getElementById('p2p-item-price').innerText);
        
        if (this.userBalance >= price) {
            this.userBalance -= price;
            alert('✅ Payment Authorized by 7 Pillars. Your order has been sent to the Empire Inbox.');
            this.closeModal();
            // Redirect to Inbox so the user can finalize the order with you
            window.location.href = 'inbox.html';
        } else {
            alert('❌ Insufficient Coins. Please top up your account at the Headquarters.');
        }
    }
};
