/**
 * NAWI-EMPIRE | PROFILE IDENTITY CONTROLLER
 * Targeted for Pillar 7 (Apparel Studio) and Citizen Reputation.
 * Optimized for Aurora-231 (DB-231 GCN) Infrastructure.
 */

const profileController = {
    // Configuration for the Sovereign Node
    apiBase: '/api/citizens',
    assetBase: '/api/pillarassets',

    init: async function() {
        console.log("Synchronizing Citizen Identity with Master Authority...");
        const urlParams = new URLSearchParams(window.location.search);
        const citizenId = urlParams.get('id') || 'me'; // Default to logged-in user

        await this.loadCitizenData(citizenId);
        await this.loadSovereignPortfolio(citizenId);
    },

    /**
     * Fetches Citizen Metadata and Verification Status
     * Direct link to authController.js on GitHub
     */
    loadCitizenData: async function(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            const data = await response.json();

            // Injecting Data into profile.html
            document.getElementById('citizen-name').textContent = data.displayName.toUpperCase();
            document.getElementById('citizen-rank').textContent = `RANK: ${data.rank || 'CITIZEN'}`;
            document.getElementById('avatar-img').src = data.avatar || 'default-avatar.png';
            
            // Stats Management
            document.getElementById('trade-count').textContent = data.stats.trades || 0;
            document.getElementById('reputation').textContent = `${data.stats.reputation || 100}%`;
            
            // Master Authority Verification Check
            if (data.isVerified) {
                const statusBadge = document.getElementById('auth-status');
                statusBadge.style.color = '#d4af37'; // Crystalline Gold
                statusBadge.textContent = "VERIFIED BY NAWI-EMPIRE001";
            }
        } catch (error) {
            console.error("Identity Sync Failed:", error);
        }
    },

    /**
     * Pulls High-Fidelity Renders from Pillar 7 (Apparel Studio)
     * Filters for Sovereign Stylist specific assets
     */
    loadSovereignPortfolio: async function(id) {
        const displayGrid = document.getElementById('portfolio-display');
        
        try {
            // Specifically fetching assets where pillar_origin = 7
            const response = await fetch(`${this.assetBase}?owner=${id}&pillar=7`);
            const assets = await response.json();

            if (assets.length === 0) {
                displayGrid.innerHTML = '<p style="color:#555;">No Studio Renders Authenticated.</p>';
                return;
            }

            // Update Studio Render count in Stats
            document.getElementById('designs-count').textContent = assets.length;

            // Render Portfolio Items with Technical Luxury Styling
            displayGrid.innerHTML = assets.map(asset => `
                <div class="portfolio-item" onclick="viewAssetDetails('${asset._id}')">
                    <img src="${asset.renderUrl}" style="width:100%; height:100%; object-fit:cover;">
                    <div class="portfolio-label">
                        ${asset.name.toUpperCase()} | PILLAR 07
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error("Portfolio Sync Failed:", error);
            displayGrid.innerHTML = '<p style="color:red;">Error accessing Pillar 7 Vault.</p>';
        }
    }
};

// Start initialization on DOM load
document.addEventListener('DOMContentLoaded', () => profileController.init());

/**
 * P2P Gateway Bridge
 * Allows others to view or license apparel designs directly from the profile
 */
function viewAssetDetails(assetId) {
    // Redirects to the Sovereign P2P Gateway for licensing
    window.location.href = `/market.html?asset=${assetId}`;
}
