/**
 * NAWI-EMPIRE V1: THE IMPERIAL SOVEREIGN CORE
 * Target: Universal (Spark 30C, iOS, Android, Web)
 * Authority: NAWI-EMPIRE001
 */

const NawiEmpire = {
    config: {
        version: "1.2.0-Sovereign",
        reserve: 35000000, // $35M Platform Liquidity
        rates: { spread: 0.08, royalty: 0.02 },
        pillars: ['General', 'Market', 'Games', 'Studio', 'LiveStream', 'Kitchen', 'Music', 'Stylist']
    },

    // 🛡️ BORDER CONTROL & SECURITY
    security: {
        restricted: ["whatsapp", "telegram", "+234", "dm me", "inbox me"],
        
        // Prevents platform leakage to external apps
        sanitizeContent: (text) => {
            const forbidden = NawiEmpire.security.restricted.some(word => text.toLowerCase().includes(word));
            if (forbidden) {
                console.warn("SECURITY ALERT: External contact detected. Flagging for Master Seal.");
                return "CONTENT_RESTRICTED_BY_EMPIRE";
            }
            return text;
        }
    },

    // 💰 ECONOMIC ENGINE
    economy: {
        calculatePayout: (coins) => coins * NawiEmpire.config.rates.royalty,
        
        processWithdrawal: (amount, reputation) => {
            // High-value transfers require your Spark 30C manual approval
            return (amount > 200000 || reputation < 90) ? "PENDING_MASTER_APPROVAL" : "AUTO_DISBURSED";
        }
    },

    // 🖼️ SOVEREIGN RENDERING ENGINE
    ui: {
        async renderFeed() {
            const feedElement = document.getElementById('home-feed');
            if (!feedElement) return;

            try {
                const response = await fetch('/api/home-feed');
                const posts = await response.json();

                feedElement.innerHTML = posts.map(post => {
                    // Logic for Pillar 7 (Stylist) and Ads
                    const isStylist = post.pillar_origin === 7 ? 'sovereign-stylist' : '';
                    const isAd = post.content_type === 'Sponsored_Ad';
                    
                    // Sanitize caption through the Security Shield
                    const safeCaption = NawiEmpire.security.sanitizeContent(post.caption || "");

                    return `
                        <div class="post-card ${isStylist}" data-pillar="${post.pillar_origin}">
                            <div class="post-header">
                                <span class="pillar-tag">PILLAR ${post.pillar_origin}: ${NawiEmpire.config.pillars[post.pillar_origin]}</span>
                                ${isAd ? '<span class="ad-badge">PROMOTED BY ADS MANAGER</span>' : ''}
                                ${post.is_master_post ? '<span class="master-seal">👑 FOUNDER</span>' : ''}
                            </div>
                            
                            <div class="post-media">
                                <img src="${post.media_url}" alt="Empire Asset" loading="lazy">
                            </div>

                            <div class="post-content">
                                <h3>${safeCaption}</h3>
                                <div class="post-footer">
                                    <span>AUTH: NAWI-EMPIRE001</span>
                                    <span class="price-tag">${post.priceInCoins || 0} COINS</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } catch (err) {
                console.error("Feed sync failed:", err);
            }
        },

        init() {
            console.log(`NAWI-EMPIRE Core Online. Version: ${this.config.version}`);
            this.renderFeed();
        }
    }
};

// Start the Empire
document.addEventListener('DOMContentLoaded', () => NawiEmpire.ui.init());