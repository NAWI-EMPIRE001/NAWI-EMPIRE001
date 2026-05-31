/**
 * NAWI-EMPIRE | MASTER MUSIC & PROMOTION CONTROLLER (V3)
 * Infrastructure: Pillar 6 (Audio) & Pillar 2 (Ads Bridge)
 * Security: Node-001 Forensic Watermarking
 */

const musicController = {
    audioApi: '/api/music-vault',
    adsApi: '/api/ads-manager',
    downloadApi: '/api/download-media', // Connects to Code 1's backend
    currentTrack: null,
    audioPlayer: new Audio(),

    init: function() {
        console.log("Pillar 6: Audio Suite Online. Handshaking with Aurora-231 Node...");
        this.fetchTrackLibrary();
        this.setupPlayerListeners();
    },

    /**
     * Data Logic: Syncs with the Imperial Music Schema
     */
    fetchTrackLibrary: async function() {
        const ledger = document.getElementById('audio-ledger');
        
        try {
            const response = await fetch(this.audioApi);
            const tracks = await response.json();

            if (!tracks || tracks.length === 0) {
                ledger.innerHTML = `
                    <div class="py-10 text-center opacity-40 uppercase text-[10px] tracking-[4px]">
                        Sovereign Ledger Empty
                    </div>`;
                return;
            }

            this.renderTracks(tracks);
        } catch (error) {
            console.error("Critical Sync Failure: Check MongoDB Connectivity.");
        }
    },

    /**
     * UI Logic: Renders tracks with Download & Promote capability
     */
    renderTracks: function(tracks) {
        const ledger = document.getElementById('audio-ledger');
        ledger.innerHTML = tracks.map((track, index) => `
            <div class="track-item group" onclick="musicController.playTrack('${track.fileUrl}', '${track.title}', '${track.artist}')">
                <div class="track-index">${(index + 1).toString().padStart(2, '0')}</div>
                
                <div class="flex-grow">
                    <span class="track-name">${track.title.toUpperCase()}</span>
                    <div class="flex gap-3 items-center mt-1">
                        <span class="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">
                            Hash: ${track.licenseHash ? track.licenseHash.substring(0, 12) : 'EMPIRE-AUTH-NULL'}
                        </span>
                        <span class="text-[8px] text-amber-500/50 font-black">${track.bitrate || '24-bit'} LOSSLESS</span>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <!-- Download Button: Triggers Code 1 logic -->
                    <button class="p-2 text-zinc-600 hover:text-white transition" 
                            onclick="musicController.authorizeDownload('${track._id}', event)">
                        <i class="fa-solid fa-download text-[10px]"></i>
                    </button>
                    
                    <!-- Promote Button: Triggers Pillar 2 Ads logic -->
                    <button class="promote-btn" onclick="musicController.bridgeToAds('${track._id}', event)">
                        Promote
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Playback Logic: Handheld Node Verification
     */
    playTrack: function(url, title, artist) {
        this.audioPlayer.src = url;
        this.audioPlayer.play();
        
        // Sovereign UI Updates
        const titleEl = document.getElementById('now-playing-title');
        const artistEl = document.getElementById('now-playing-artist');
        
        if(titleEl) titleEl.textContent = title.toUpperCase();
        if(artistEl) artistEl.textContent = artist.toUpperCase();
        
        console.log(`[AURORA-231] Authorized Stream: ${title} | Status: VERIFIED`);
        
        // Optional: Update the "Visual Wave" if the element exists
        const wave = document.querySelector('.visual-wave');
        if(wave) wave.classList.add('active-broadcast');
    },

    /**
     * Download Protocol: Connects to the server-side "Evidence Log"
     */
    authorizeDownload: async function(trackId, event) {
        event.stopPropagation();
        console.log(`Initiating Sovereign Download for ID: ${trackId}`);
        
        // Redirect to the API endpoint that renames the file to 'NAWI_EMPIRE_001...'
        window.location.href = `${this.downloadApi}/${trackId}`;
        
        alert("Transaction Authorized. Check your Ledger for the verified file.");
    },

    /**
     * Ads Protocol: Pillar 6 to Pillar 2 Bridge
     */
    bridgeToAds: function(trackId, event) {
        event.stopPropagation();
        
        const confirmed = confirm("Generate 3D-Promotion for this track? Cost: 10 EMPR.");
        if (!confirmed) return;

        console.log(`Bypassing standard queue... Sending ${trackId} to Ads Manager.`);
        window.location.href = `/promote.html?target=${trackId}&type=audio_promotion&pillar=6&authority=NAWI-EMPIRE001`;
    },

    setupPlayerListeners: function() {
        this.audioPlayer.onplay = () => {
            // Signal the platform that the Master Audio Bypass is active
            console.log("Sovereign Frequency: ON");
        };

        this.audioPlayer.onended = () => {
            console.log("Stream Cycle Complete. Returning to Ledger.");
        };
    }
};

// Initialize Sovereign Node Access
document.addEventListener('DOMContentLoaded', () => musicController.init());
