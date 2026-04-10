const DataManager = require('./dataManager');

class Patient {
    static viewOwnBlockchain(patientId) {
        const pbc = DataManager.loadPBC(patientId);
        if (!pbc) return { success: false, message: 'Patient blockchain not found.' };
        
        DataManager.logHBC('PATIENT_VIEW_OWN_HISTORY', { patientId });
        return { success: true, chain: pbc.chain };
    }

    static confirmDiagnosis(patientId, blockIndex) {
        const pbc = DataManager.loadPBC(patientId);
        if (!pbc) return { success: false, message: 'Patient blockchain not found.' };
        
        const block = pbc.chain[blockIndex];
        if (!block || block.type !== 'DIAGNOSIS') return { success: false, message: 'Diagnosis block not found.' };
        
        pbc.addBlock('PATIENT_CONFIRMATION', { diagnosisBlockIndex: blockIndex, patientId });
        DataManager.savePBC(patientId, pbc);
        
        DataManager.logHBC('PATIENT_CONFIRM_DIAGNOSIS', { patientId, blockIndex });
        return { success: true, message: 'Diagnosis confirmed.' };
    }

    static viewHospitalUpdates() {
        const hbc = DataManager.loadHBC();
        const notices = hbc.chain.filter(b => b.type === 'HOSPITAL_NOTICE');
        
        DataManager.logHBC('PATIENT_VIEW_HOSPITAL_NOTICES', { timestamp: new Date().toISOString() });
        return { success: true, notices };
    }

    static generateToken(patientId, type, issuedTo, blockIndex = null) {
        const tokenId = `TOKEN_${Date.now()}`;
        const tokens = DataManager.loadTokens();
        
        const newToken = {
            token_id: tokenId,
            patient_id: patientId,
            type: type, // 'MAIN' or 'LIMITED'
            block_index: blockIndex,
            issued_to: issuedTo,
            timestamp: new Date().toISOString()
        };
        
        tokens.push(newToken);
        DataManager.saveTokens(tokens);
        
        DataManager.logHBC('PATIENT_GENERATE_TOKEN', { patientId, tokenId, type, issuedTo });
        return { success: true, tokenId, token: newToken };
    }

    static grantAccessToInsurance(patientId, insuranceId, tokenId) {
        DataManager.logHBC('PATIENT_GRANT_INSURANCE_ACCESS', { patientId, insuranceId, tokenId });
        return { success: true, message: `Access granted to insurance ${insuranceId}.` };
    }

    static submitComplaint(patientId, message) {
        DataManager.logHBC('PATIENT_COMPLAINT', { patientId, message });
        return { success: true, message: 'Complaint/Suggestion submitted.' };
    }

    static changePassword(patientId, newPassword) {
        const users = DataManager.loadUsers();
        const patient = users.find(u => u.id === patientId && u.role === 'PATIENT');
        
        if (!patient) return { success: false, message: 'Patient not found.' };
        
        patient.password_hash = DataManager.hashPassword(newPassword);
        DataManager.saveUsers(users);
        
        DataManager.logHBC('PATIENT_CHANGE_PASSWORD', { patientId });
        return { success: true, message: 'Password updated successfully.' };
    }

    static requestAppointment(patientId) {
        const requestId = `REQ_${Date.now()}`;
        DataManager.logHBC('APPOINTMENT_REQUEST', { requestId, patientId });
        return { success: true, requestId, message: `Appointment request ${requestId} submitted.` };
    }
}

module.exports = Patient;
