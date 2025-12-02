const fs = require('fs');

async function testAllEndpoints() {
    const BASE_URL = 'http://localhost:8080';
    console.log("🚀 Starting Comprehensive API Test...\n");

    // --- STEP 1: Test Decryption ---
    console.log("1️⃣  Testing POST /decrypt-seed");
    
    if (!fs.existsSync('./encrypted_seed.txt')) {
        console.error("❌ Error: 'encrypted_seed.txt' is missing. Run Step 4 first!");
        return;
    }
    
    const encryptedSeed = fs.readFileSync('./encrypted_seed.txt', 'utf8').trim();
    
    try {
        const decryptRes = await fetch(`${BASE_URL}/decrypt-seed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted_seed: encryptedSeed })
        });
        
        // Robust Error Handling: Read text first to catch HTML errors
        const decryptText = await decryptRes.text();
        console.log(`   Status: ${decryptRes.status}`);
        
        try {
            const decryptData = JSON.parse(decryptText);
            console.log(`   Response: ${JSON.stringify(decryptData)}`);
        } catch (e) {
            console.error(`   ❌ invalid JSON. Server sent: ${decryptText.substring(0, 100)}`);
            throw new Error("Server returned non-JSON response");
        }

        if (!decryptRes.ok) throw new Error("Decryption failed");

    } catch (e) {
        console.error("   ❌ Failed:", e.message);
        return; // Stop if decryption fails
    }

    // --- STEP 2: Test Generation ---
    console.log("\n2️⃣  Testing GET /generate-2fa");
    let generatedCode = null;
    
    try {
        const genRes = await fetch(`${BASE_URL}/generate-2fa`);
        
        // Robust Error Handling
        const genText = await genRes.text();
        console.log(`   Status: ${genRes.status}`);

        let genData;
        try {
            genData = JSON.parse(genText);
            console.log(`   Response: ${JSON.stringify(genData)}`);
        } catch (e) {
            // This catches the "<!DOCTYPE..." error and shows you the real issue
            console.error(`   ❌ Invalid JSON. Server sent: ${genText.substring(0, 100)}...`);
            throw new Error("Server returned non-JSON response (Likely 404 Not Found)");
        }
        
        if (genRes.ok) {
            generatedCode = genData.code;
            console.log(`   ✅ Got Code: ${generatedCode}`);
        }
    } catch (e) {
        console.error("   ❌ Failed:", e.message);
    }

    // --- STEP 3: Test Verification ---
    if (generatedCode) {
        console.log("\n3️⃣  Testing POST /verify-2fa");
        try {
            const verifyRes = await fetch(`${BASE_URL}/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: generatedCode })
            });
            
            const verifyText = await verifyRes.text();
            console.log(`   Status: ${verifyRes.status}`);

            try {
                const verifyData = JSON.parse(verifyText);
                console.log(`   Response: ${JSON.stringify(verifyData)}`);
                
                if (verifyData.valid === true) {
                    console.log("\n🎉 SUCCESS: Full flow verified!");
                } else {
                    console.log("\n⚠️  WARNING: Verification returned false");
                }
            } catch (e) {
                console.error(`   ❌ Invalid JSON. Server sent: ${verifyText.substring(0, 100)}`);
            }
            
        } catch (e) {
            console.error("   ❌ Failed:", e.message);
        }
    }
}

testAllEndpoints();