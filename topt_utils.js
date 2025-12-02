const { Authenticator } = require('otplib');
const base32 = require('hi-base32');

/**
 * Generate current TOTP code from hex seed
 * @param {string} hex_seed - 64-character hex string
 * @returns {string} - 6-digit TOTP code
 */
function generate_totp_code(hex_seed) {
    try {
        // Implementation Step 1: Convert hex seed to bytes
        // "Parse 64-character hex string to bytes"
        const buffer = Buffer.from(hex_seed, 'hex');

        // Implementation Step 2: Convert bytes to base32 encoding
        // "Encode the bytes using base32 encoding"
        const secret = base32.encode(buffer);

        // Implementation Step 3: Create TOTP object
        // "Initialize with base32-encoded seed"
        // "Use default settings: SHA-1, 30s period, 6 digits"
        const totp = new Authenticator();
        
        // Implementation Step 4: Generate current TOTP code
        // "Returns 6-digit string"
        const code = totp.generate(secret);

        // Implementation Step 5: Return the code
        return code;

    } catch (error) {
        console.error("Error generating TOTP:", error.message);
        throw error;
    }
}

/**
 * Verify TOTP code with time window tolerance
 * @param {string} hex_seed - 64-character hex string
 * @param {string} code - 6-digit code to verify
 * @param {number} valid_window - Number of periods tolerance (default 1)
 * @returns {boolean} - True if valid, False otherwise
 */
function verify_totp_code(hex_seed, code, valid_window = 1) {
    try {
        // Implementation Step 1: Convert hex seed to base32
        const buffer = Buffer.from(hex_seed, 'hex');
        const secret = base32.encode(buffer);

        // Implementation Step 2: Create TOTP object
        const totp = new Authenticator();

        // Implementation Step 3: Verify code with time window tolerance
        // "Use valid_window parameter"
        totp.options = { window: valid_window };

        // Implementation Step 4: Return verification result
        return totp.check(code, secret);

    } catch (error) {
        console.error("Error verifying TOTP:", error.message);
        return false;
    }
}

// Export functions for use in index.js and cron_task.js
module.exports = { generate_totp_code, verify_totp_code };