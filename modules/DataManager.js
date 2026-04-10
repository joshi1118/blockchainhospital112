const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Blockchain = require('../blockchain/blockchain');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');
const HOSPITAL_CHAIN_FILE = path.join(DATA_DIR, 'hospital_chain.json');
const PATIENT_CHAINS_DIR = path.join(DATA_DIR, 'patient_chains');
const CONFIG_FILE = path.join(__dirname, '../config.json');

class DataManager {
    static init() {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
        if (!fs.existsSync(PATIENT_CHAINS_DIR)) fs.mkdirSync(PATIENT_CHAINS_DIR);
        if (!fs.existsSync(USERS_FILE)) {
            // Default users
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            const adminPasswordHash = this.hashPassword(config.ADMIN_PASSWORD);
            const hospitalPasswordHash = this.hashPassword('hospital123');
            const insurancePasswordHash = this.hashPassword('insurance123');
            fs.writeFileSync(USERS_FILE, JSON.stringify([
                { id: 'admin', name: 'System Administrator', role: 'ADMIN', password_hash: adminPasswordHash },
                { id: 'hospital_01', name: 'General Hospital', role: 'HOSPITAL', password_hash: hospitalPasswordHash },
                { id: 'ins_01', name: 'ABC Insurance', role: 'INSURANCE', password_hash: insurancePasswordHash }
            ], null, 2));
        }
        if (!fs.existsSync(TOKENS_FILE)) fs.writeFileSync(TOKENS_FILE, JSON.stringify([], null, 2));
        if (!fs.existsSync(HOSPITAL_CHAIN_FILE)) {
            const hbc = new Blockchain('HBC', { message: 'Hospital Blockchain Genesis' });
            fs.writeFileSync(HOSPITAL_CHAIN_FILE, JSON.stringify(hbc.chain, null, 2));
        }
    }

    static hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    // --- Users ---
    static loadUsers() {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }

    static saveUsers(users) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }

    // --- Tokens ---
    static loadTokens() {
        return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    }

    static saveTokens(tokens) {
        fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    }

    // --- Hospital Blockchain (HBC) ---
    static loadHBC() {
        const data = JSON.parse(fs.readFileSync(HOSPITAL_CHAIN_FILE, 'utf8'));
        const blockchain = new Blockchain('HBC');
        blockchain.chain = data;
        return blockchain;
    }

    static saveHBC(blockchain) {
        fs.writeFileSync(HOSPITAL_CHAIN_FILE, JSON.stringify(blockchain.chain, null, 2));
    }

    static logHBC(type, data) {
        const hbc = this.loadHBC();
        hbc.addBlock(type, data);
        this.saveHBC(hbc);
    }

    // --- Patient Blockchains (PBC) ---
    static loadPBC(patientId) {
        const filePath = path.join(PATIENT_CHAINS_DIR, `${patientId}.json`);
        if (!fs.existsSync(filePath)) return null;
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const blockchain = new Blockchain('PBC');
        blockchain.chain = data;
        return blockchain;
    }

    static savePBC(patientId, blockchain) {
        const filePath = path.join(PATIENT_CHAINS_DIR, `${patientId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(blockchain.chain, null, 2));
    }

    static createPBC(patientId, patientData) {
        const pbc = new Blockchain('PBC', patientData);
        this.savePBC(patientId, pbc);
        return pbc;
    }

    // --- System Management ---
    static deleteAllData() {
        if (fs.existsSync(DATA_DIR)) {
            fs.rmSync(DATA_DIR, { recursive: true, force: true });
        }
        this.init();
    }
}

module.exports = DataManager;
