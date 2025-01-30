// Function to convert a number to Base36
const base36Encode = (number) => {
    return number.toString(36);
}

// Function to generate the short hash
export const generateHashText = async (text: string): Promise<string> => {
    const length = 15;
    // Generate the text hash using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    return crypto.subtle.digest("SHA-256", data).then((hashBuffer) => {
        // Convert the hash to an integer
        let hashArray = Array.from(new Uint8Array(hashBuffer));
        let hashInt = BigInt("0x" + hashArray.map(byte => byte.toString(16).padStart(2, '0')).join(''));

        // Convert the integer to Base36
        let base36Hash = base36Encode(hashInt);

        // Return a shorter portion of the hash
        return base36Hash.slice(0, length);
    });
}
