const DataManager = require('./dataManager');

class Insurance {
    static login(id, password) {
        const users = DataManager.loadUsers();
        const insurance = users.find(u => u.id === id && u.role === 'INSURANCE');
        
        if (!insurance) return { success: false, message: 'Insurance ID not found.' };
        
        const passwordHash = DataManager.hashPassword(password);
        if (insurance.password_hash !== passwordHash) return { success: false, message: 'Incorrect password.' };
        
        DataManager.logHBC('INSURANCE_LOGIN', { insuranceId: id });
        return { success: true, user: insurance };
    }

    static accessData(insuranceId, tokenId) {
        const tokens = DataManager.loadTokens();
        const token = tokens.find(t => t.token_id === tokenId && t.issued_to === insuranceId);
        
        if (!token) return { success: false, message: 'Invalid or missing token.' };
        
        const pbc = DataManager.loadPBC(token.patient_id);
        if (!pbc) return { success: false, message: 'Patient blockchain not found.' };
        
        DataManager.logHBC('INSURANCE_ACCESS_DATA', { insuranceId, tokenId, patientId: token.patient_id });
        
        if (token.type === 'MAIN') {
            return { success: true, data: pbc.chain };
        } else if (token.type === 'LIMITED') {
            const block = pbc.chain[token.block_index];
            if (!block) return { success: false, message: 'Block index not found in patient chain.' };
            return { success: true, data: block };
        }
        
        return { success: false, message: 'Invalid token type.' };
    }

    static changePassword(id, newPassword) {
        const users = DataManager.loadUsers();
        const insurance = users.find(u => u.id === id && u.role === 'INSURANCE');
        
        if (!insurance) return { success: false, message: 'Insurance account not found.' };
        
        insurance.password_hash = DataManager.hashPassword(newPassword);
        DataManager.saveUsers(users);
        
        DataManager.logHBC('INSURANCE_CHANGE_PASSWORD', { insuranceId: id });
        return { success: true, message: 'Password updated successfully.' };
    }
}

module.exports = Insurance;
