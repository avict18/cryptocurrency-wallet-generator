 const bip32 = require('bip32');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');

try {
    // Define the network and path (validate path based on network choice)
    const network = bitcoin.networks.mainnet; // Change to bitcoin.networks.testnet for testnet
    const path = network === bitcoin.networks.mainnet 
        ? "m/49'/0'/0'/0/0" // BIP49 mainnet path
        : "m/49'/1'/0'/0/0"; // BIP49 testnet path

    // Generate mnemonic
    const mnemonic = bip39.generateMnemonic();
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Generated mnemonic is invalid. Please regenerate.');
    }
    
    // Generate seed from mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    
    // Create root node from seed
    let root;
    try {
        root = bip32.fromSeed(seed, network);
    } catch (error) {
        throw new Error('Failed to create root node. Possible network mismatch.');
    }

    // Derive account and address
    let account;
    try {
        account = root.derivePath(path);
    } catch (error) {
        throw new Error(`Failed to derive path: ${path}. Ensure the path follows BIP49 standard.`);
    }

    // Derive address node (first account)
    const node = account.derive(0).derive(0);
    if (!node.privateKey || !node.publicKey) {
        throw new Error('Generated keys are invalid. Please regenerate.');
    }

    // Generate Bitcoin address in SegWit (p2wpkh) format
    const btcAddress = bitcoin.payments.p2wpkh({ pubkey: node.publicKey, network }).address;
    
    console.log("Wallet generated with address:", btcAddress);
    console.log("Private key:", node.toWIF());
    console.log("Mnemonic:", mnemonic);

} catch (error) {
    console.error("Error generating wallet:", error.message);
}
