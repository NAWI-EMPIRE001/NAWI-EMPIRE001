/**
 * NAWI-EMPIRE MONGODB GATEWAY
 * Authority: 7 Pillars Control Center
 * Status: Updated with Secure Private Key
 */

const MONGO_CONFIG = {
    // 🏛️ STEP 1: Paste the URL from the "Data API" section here
    endpoint: "YOUR_MONGODB_HTTPS_ENDPOINT_URL", 
    
    // 🏛️ STEP 2: Your verified Private Key
    apiKey: "8298c3ae0715"
};

async function pushToGlobalMarket(productData) {
    try {
        const response = await fetch(MONGO_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGO_CONFIG.apiKey
            },
            body: JSON.stringify({
                dataSource: "NAWI-EMPIRE001", // Your Cluster Name
                database: "NAWI-EMPIRE",      // Your Database Name
                collection: "Kitchen-meals",  // Updated to match your folder
                document: productData
            })
        });

        if (response.ok) {
            console.log("Success: Product pushed to NAWI-EMPIRE Global Market.");
            return { success: true };
        } else {
            const error = await response.json();
            console.error("Empire DB Error:", error);
            return { success: false };
        }
    } catch (err) {
        console.error("Connection Failed: Check your internet or endpoint URL.", err);
        return { success: false };
    }
}
