const DataManager = require('./dataManager');

class Hospital {
    static registerPatient(id, name, password) {
        const users = DataManager.loadUsers();
        if (users.find(u => u.id === id)) return { success: false, message: 'Patient ID already exists.' };
        
        const passwordHash = DataManager.hashPassword(password);
        users.push({ id, name, role: 'PATIENT', password_hash: passwordHash });
        DataManager.saveUsers(users);
        
        DataManager.createPBC(id, { id, name, type: 'PATIENT_GENESIS' });
        
        DataManager.logHBC('HOSPITAL_REGISTER_PATIENT', { hospital: 'hospital', patientId: id, name });
        return { success: true, message: `Patient ${name} registered successfully.` };
    }

    static handleAppointmentRequest(patientId, status, time = null) {
        const hbc = DataManager.loadHBC();
        const requestBlock = hbc.chain.find(b => b.data.patientId === patientId && b.type === 'APPOINTMENT_REQUEST');
        
        if (!requestBlock) return { success: false, message: 'Appointment request not found.' };
        
        DataManager.logHBC('HOSPITAL_HANDLE_APPOINTMENT', {
            hospital: 'hospital',
            patientId,
            status,
            time,
            requestId: requestBlock.data.requestId
        });
        return { success: true, message: `Appointment for patient ${patientId} ${status}.` };
    }

    static publishNotice(notice) {
        DataManager.logHBC('HOSPITAL_NOTICE', { hospital: 'hospital', notice });
        return { success: true, message: 'Notice published.' };
    }

    static markDoctorAbsent(doctorId) {
        const users = DataManager.loadUsers();
        const doctor = users.find(u => u.id === doctorId && u.role === 'DOCTOR');
        
        if (!doctor) return { success: false, message: 'Doctor not found.' };
        
        DataManager.logHBC('HOSPITAL_MARK_DOCTOR_ABSENT', { hospital: 'hospital', doctorId, name: doctor.name });
        return { success: true, message: `Doctor ${doctorId} marked as absent.` };
    }
}

module.exports = Hospital;
