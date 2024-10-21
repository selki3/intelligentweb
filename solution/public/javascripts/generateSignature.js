/**
 * Generates a random hash string of the specified length.
 * Uses the crypto API to get random values and transforms them to hexadecimal.
 *
 * @param {number} length - The desired length of the output hash string.
 * @returns {string} - A random hash string of the specified length.
 */
function generateRandomHash(length) {
    let array = new Uint8Array(length / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

let signature = generateRandomHash(32);

document.getElementById("signature").value = signature;
