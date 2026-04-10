const DataManager = require('./dataManager');

class Admin {
    static viewPatientBlockchain(patientId) {
        const pbc = DataManager.loadPBC(patientId);
        if (!pbc) return { success: false, message: 'Patient blockchain not found.' };
        
        DataManager.logHBC('ADMIN_VIEW_PATIENT_HISTORY', { admin: 'admin', patientId });
        return { success: true, chain: pbc.chain };
    }

    static addDoctor(id, name, password) {
        const users = DataManager.loadUsers();
        if (users.find(u => u.id === id)) return { success: false, message: 'User ID already exists.' };
        
        const passwordHash = DataManager.hashPassword(password);
        users.push({ id, name, role: 'DOCTOR', password_hash: passwordHash });
        DataManager.saveUsers(users);
        
        DataManager.logHBC('ADMIN_ADD_DOCTOR', { admin: 'admin', doctorId: id, name });
        return { success: true, message: `Doctor ${name} added successfully.` };
    }

    static removeDoctor(id) {
        let users = DataManager.loadUsers();
        const initialLength = users.length;
        users = users.filter(u => u.id !== id || u.role !== 'DOCTOR');
        
        if (users.length === initialLength) return { success: false, message: 'Doctor not found.' };
        
        DataManager.saveUsers(users);
        DataManager.logHBC('ADMIN_REMOVE_DOCTOR', { admin: 'admin', doctorId: id });
        return { success: true, message: `Doctor ${id} removed successfully.` };
    }

    static updateDoctorPassword(id, newPassword) {
        const users = DataManager.loadUsers();
        const doctor = users.find(u => u.id === id && u.role === 'DOCTOR');
        
        if (!doctor) return { success: false, message: 'Doctor not found.' };
        
        doctor.password_hash = DataManager.hashPassword(newPassword);
        DataManager.saveUsers(users);
        
        DataManager.logHBC('ADMIN_UPDATE_DOCTOR_PASSWORD', { admin: 'admin', doctorId: id });
        return { success: true, message: `Password for doctor ${id} updated.` };
    }

    static handleDoctorRequest(requestId, status) {
        const hbc = DataManager.loadHBC();
        const requestBlock = hbc.chain.find(b => b.data.requestId === requestId && b.type === 'DOCTOR_ACCESS_REQUEST');
        
        if (!requestBlock) return { success: false, message: 'Access request not found.' };
        
        DataManager.logHBC('ADMIN_HANDLE_DOCTOR_REQUEST', {
            admin: 'admin',
            requestId,
            doctorId: requestBlock.data.doctorId,
            patientId: requestBlock.data.patientId,
            status
        });
        return { success: true, message: `Request ${requestId} ${status}.` };
    }
}

module.exports = Admin;
