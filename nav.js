// nav.js - The Empire's Global Controller

const API_URL = "https://nawi-empire1.onrender.com";

async function updateEmpireUI() {
    // 1. Get the User ID from the phone's memory
    const userId = localStorage.getItem('user_id'); 
    
    if (!userId) {
        console.log("Guest Detected: Restricted Access.");
        return;
    }

    // 2. Fetch real data from your Render Server
    const response = await fetch(`${API_URL}/api/user-profile/${userId}`);
    const data = await response.json();

    // 3. Update the Coins in the Top Corner (Live)
    const coinDisplay = document.getElementById('empire-balance-top');
    if (coinDisplay) {
        coinDisplay.innerHTML = `<i class="fa-solid fa-coins"></i> ${data.balance}`;
    }

    // 4. Update the Profile Image and Name
    const userName = document.getElementById('nav-user-name');
    if (userName) userName.innerText = data.name;
}

// 5. Run this the millisecond the page opens
window.onload = updateEmpireUI;
