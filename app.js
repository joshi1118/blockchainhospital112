const readline = require('readline');
const DataManager = require('./modules/dataManager');
const Admin = require('./modules/admin');
const Hospital = require('./modules/hospital');
const Doctor = require('./modules/doctor');
const Patient = require('./modules/patient');
const Insurance = require('./modules/insurance');
const Token = require('./modules/token');
const Delete = require('./modules/delete');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

let currentUser = null;

async function login() {
    console.log('\n--- Login ---');
    const id = await question('ID: ');
    const password = await question('Password: ');
    const passwordHash = DataManager.hashPassword(password);

    const users = DataManager.loadUsers();
    const user = users.find(u => u.id === id && u.password_hash === passwordHash);

    if (user) {
        currentUser = user;
        DataManager.logHBC('USER_LOGIN', { id: user.id, role: user.role });
        console.log(`Welcome, ${user.name} (${user.role})!`);
        return true;
    } else {
        console.log('Invalid credentials.');
        return false;
    }
}

async function main() {
    DataManager.init();
    
    while (true) {
        console.log('\n--- Terminal-Based Healthcare Backend ---');
        console.log('1. Admin');
        console.log('2. Hospital');
        console.log('3. Doctor');
        console.log('4. Patient');
        console.log('5. Insurance');
        console.log('6. Exit');
        console.log('7. Delete All Data (Requires Admin Password)');

        const choice = await question('Select Role/Action: ');

        if (choice === '6') break;
        if (choice === '7') {
            const pass = await question('Admin Password: ');
            const res = Delete.deleteAllData(pass);
            console.log(res.message);
            continue;
        }

        if (await login()) {
            switch (currentUser.role) {
                case 'ADMIN': await adminMenu(); break;
                case 'HOSPITAL': await hospitalMenu(); break;
                case 'DOCTOR': await doctorMenu(); break;
                case 'PATIENT': await patientMenu(); break;
                case 'INSURANCE': await insuranceMenu(); break;
                default: console.log('Unknown role.');
            }
            currentUser = null;
        }
    }
    rl.close();
}

// --- Menus ---

async function adminMenu() {
    while (currentUser) {
        console.log('\n--- Admin Menu ---');
        console.log('1. View Patient Blockchain');
        console.log('2. Add Doctor');
        console.log('3. Remove Doctor');
        console.log('4. Update Doctor Password');
        console.log('5. Handle Doctor Request');
        console.log('6. View Hospital Blockchain (HBC)');
        console.log('0. Logout');

        const choice = await question('Action: ');
        if (choice === '0') break;

        switch (choice) {
            case '1':
                const pid = await question('Patient ID: ');
                const res1 = Admin.viewPatientBlockchain(pid);
                if (res1.success) console.log(JSON.stringify(res1.chain, null, 2));
                else console.log(res1.message);
                break;
            case '2':
                const did = await question('New Doctor ID: ');
                const dname = await question('Doctor Name: ');
                const dpass = await question('Doctor Password: ');
                const res2 = Admin.addDoctor(did, dname, dpass);
                console.log(res2.message);
                break;
            case '3':
                const rdid = await question('Doctor ID to remove: ');
                const res3 = Admin.removeDoctor(rdid);
                console.log(res3.message);
                break;
            case '4':
                const udid = await question('Doctor ID to update: ');
                const npass = await question('New Password: ');
                const res4 = Admin.updateDoctorPassword(udid, npass);
                console.log(res4.message);
                break;
            case '5':
                const rid = await question('Request ID: ');
                const status = await question('Status (APPROVED/REJECTED): ');
                const res5 = Admin.handleDoctorRequest(rid, status);
                console.log(res5.message);
                break;
            case '6':
                const hbc = DataManager.loadHBC();
                console.log(JSON.stringify(hbc.chain, null, 2));
                break;
        }
    }
}

async function hospitalMenu() {
    // Note: To simplify, I'll treat 'admin' login as Hospital too, 
    // but the spec says Hospital is a separate system role. 
    // I'll add a default hospital user in DataManager.init for the demo.
    while (currentUser) {
        console.log('\n--- Hospital Menu ---');
        console.log('1. Register Patient');
        console.log('2. Handle Appointment Request');
        console.log('3. Publish Notice');
        console.log('4. Mark Doctor Absent');
        console.log('5. View HBC');
        console.log('0. Logout');

        const choice = await question('Action: ');
        if (choice === '0') break;

        switch (choice) {
            case '1':
                const pid = await question('New Patient ID: ');
                const pname = await question('Patient Name: ');
                const ppass = await question('Patient Password: ');
                const res1 = Hospital.registerPatient(pid, pname, ppass);
                console.log(res1.message);
                break;
            case '2':
                const apid = await question('Patient ID: ');
                const astatus = await question('Status (APPROVED/REJECTED): ');
                let atime = null;
                if (astatus === 'APPROVED') atime = await question('Time (e.g., 2024-11-04 10:00 AM): ');
                const res2 = Hospital.handleAppointmentRequest(apid, astatus, atime);
                console.log(res2.message);
                break;
            case '3':
                const notice = await question('Notice: ');
                const res3 = Hospital.publishNotice(notice);
                console.log(res3.message);
                break;
            case '4':
                const did = await question('Doctor ID: ');
                const res4 = Hospital.markDoctorAbsent(did);
                console.log(res4.message);
                break;
            case '5':
                const hbc = DataManager.loadHBC();
                console.log(JSON.stringify(hbc.chain, null, 2));
                break;
        }
    }
}

async function doctorMenu() {
    while (currentUser) {
        console.log('\n--- Doctor Menu ---');
        console.log('1. Confirm Patient Attendance');
        console.log('2. Add Diagnosis');
        console.log('3. Request Access to Patient History');
        console.log('4. View Patient History (Requires Admin Approval)');
        console.log('5. Change Password');
        console.log('6. View HBC');
        console.log('0. Logout');

        const choice = await question('Action: ');
        if (choice === '0') break;

        switch (choice) {
            case '1':
                const pid = await question('Patient ID: ');
                const res1 = Doctor.confirmPatientAttendance(currentUser.id, pid);
                console.log(res1.message);
                break;
            case '2':
                const dpid = await question('Patient ID: ');
                const diag = await question('Diagnosis: ');
                const presc = await question('Prescription: ');
                const res2 = Doctor.addDiagnosis(currentUser.id, dpid, diag, presc);
                if (res2.success) console.log(`Diagnosis added to block ${res2.block.index}.`);
                else console.log(res2.message);
                break;
            case '3':
                const rpid = await question('Patient ID: ');
                const res3 = Doctor.requestAccess(currentUser.id, rpid);
                console.log(res3.message);
                break;
            case '4':
                const vpid = await question('Patient ID: ');
                const res4 = Doctor.viewPatientHistory(currentUser.id, vpid);
                if (res4.success) console.log(JSON.stringify(res4.chain, null, 2));
                else console.log(res4.message);
                break;
            case '5':
                const npass = await question('New Password: ');
                const res5 = Doctor.changePassword(currentUser.id, npass);
                console.log(res5.message);
                break;
            case '6':
                const hbc = DataManager.loadHBC();
                console.log(JSON.stringify(hbc.chain, null, 2));
                break;
        }
    }
}

async function patientMenu() {
    while (currentUser) {
        console.log('\n--- Patient Menu ---');
        console.log('1. View Own History');
        console.log('2. Confirm Diagnosis');
        console.log('3. View Hospital Updates');
        console.log('4. Request Appointment');
        console.log('5. Generate Token (MAIN/LIMITED)');
        console.log('6. Submit Complaint/Suggestion');
        console.log('7. Change Password');
        console.log('0. Logout');

        const choice = await question('Action: ');
        if (choice === '0') break;

        switch (choice) {
            case '1':
                const res1 = Patient.viewOwnBlockchain(currentUser.id);
                if (res1.success) console.log(JSON.stringify(res1.chain, null, 2));
                else console.log(res1.message);
                break;
            case '2':
                const bidx = await question('Block Index to confirm: ');
                const res2 = Patient.confirmDiagnosis(currentUser.id, parseInt(bidx));
                console.log(res2.message);
                break;
            case '3':
                const res3 = Patient.viewHospitalUpdates();
                console.log(JSON.stringify(res3.notices, null, 2));
                break;
            case '4':
                const res4 = Patient.requestAppointment(currentUser.id);
                console.log(res4.message);
                break;
            case '5':
                const type = await question('Token Type (MAIN/LIMITED): ');
                const to = await question('Issued To (e.g., INS_01): ');
                let bidx2 = null;
                if (type === 'LIMITED') bidx2 = parseInt(await question('Block Index: '));
                const res5 = Patient.generateToken(currentUser.id, type, to, bidx2);
                if (res5.success) console.log(`Token Generated: ${res5.tokenId}`);
                break;
            case '6':
                const msg = await question('Message: ');
                const res6 = Patient.submitComplaint(currentUser.id, msg);
                console.log(res6.message);
                break;
            case '7':
                const npass = await question('New Password: ');
                const res7 = Patient.changePassword(currentUser.id, npass);
                console.log(res7.message);
                break;
        }
    }
}

async function insuranceMenu() {
    while (currentUser) {
        console.log('\n--- Insurance Menu ---');
        console.log('1. Access Patient Data with Token');
        console.log('2. Change Password');
        console.log('0. Logout');

        const choice = await question('Action: ');
        if (choice === '0') break;

        switch (choice) {
            case '1':
                const tid = await question('Token ID: ');
                const res1 = Insurance.accessData(currentUser.id, tid);
                if (res1.success) console.log(JSON.stringify(res1.data, null, 2));
                else console.log(res1.message);
                break;
            case '2':
                const npass = await question('New Password: ');
                const res2 = Insurance.changePassword(currentUser.id, npass);
                console.log(res2.message);
                break;
        }
    }
}

main().catch(err => console.error(err));
