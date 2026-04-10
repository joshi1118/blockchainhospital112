const DataManager = require('./dataManager');

class Doctor {
    static confirmPatientAttendance(doctorId, patientId) {
        DataManager.logHBC('DOCTOR_CONFIRM_VISIT', { doctorId, patientId });
        return { success: true, message: `Patient ${patientId} attendance confirmed.` };
    }

    static addDiagnosis(doctorId, patientId, diagnosis, prescription) {
        const pbc = DataManager.loadPBC(patientId);
        if (!pbc) return { success: false, message: 'Patient blockchain not found.' };
        
        const diagnosisBlock = pbc.addBlock('DIAGNOSIS', {
            doctorId,
            diagnosis,
            prescription,
            status: 'PENDING_CONFIRMATION'
        });
        DataManager.savePBC(patientId, pbc);
        
        DataManager.logHBC('DOCTOR_ADD_DIAGNOSIS', { doctorId, patientId, diagnosisBlockIndex: diagnosisBlock.index });
        return { success: true, block: diagnosisBlock };
    }

    static changePassword(doctorId, newPassword) {
        const users = DataManager.loadUsers();
        const doctor = users.find(u => u.id === doctorId && u.role === 'DOCTOR');
        
        if (!doctor) return { success: false, message: 'Doctor not found.' };
        
        doctor.password_hash = DataManager.hashPassword(newPassword);
        DataManager.saveUsers(users);
        
        DataManager.logHBC('DOCTOR_CHANGE_PASSWORD', { doctorId });
        return { success: true, message: 'Password updated successfully.' };
    }

    static requestAccess(doctorId, patientId) {
        const requestId = `REQ_${Date.now()}`;
        DataManager.logHBC('DOCTOR_ACCESS_REQUEST', { requestId, doctorId, patientId });
        return { success: true, requestId, message: `Access request ${requestId} submitted.` };
    }

    static viewPatientHistory(doctorId, patientId) {
        const hbc = DataManager.loadHBC();
        const approval = hbc.chain.find(b => 
            b.type === 'ADMIN_HANDLE_DOCTOR_REQUEST' && 
            b.data.doctorId === doctorId && 
            b.data.patientId === patientId && 
            b.data.status === 'APPROVED'
        );
        
        if (!approval) return { success: false, message: 'No approved access request found.' };
        
        const pbc = DataManager.loadPBC(patientId);
        DataManager.logHBC('DOCTOR_VIEW_HISTORY', { doctorId, patientId });
        return { success: true, chain: pbc.chain };
    }
}

module.exports = Doctor;
