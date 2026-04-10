const DataManager = require('./dataManager');

class Token {
    static validateToken(tokenId, patientId, type, scope = null) {
        const tokens = DataManager.loadTokens();
        const token = tokens.find(t => t.token_id === tokenId && t.patient_id === patientId);
        
        if (!token) return { success: false, message: 'Token not found or invalid for this patient.' };
        if (token.type !== type) return { success: false, message: 'Token type mismatch.' };
        if (type === 'LIMITED' && token.block_index !== scope) return { success: false, message: 'Token scope mismatch.' };
        
        return { success: true, token };
    }

    static getPatientTokens(patientId) {
        const tokens = DataManager.loadTokens();
        return tokens.filter(t => t.patient_id === patientId);
    }
}

module.exports = Token;
