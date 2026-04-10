const DataManager = require('./modules/dataManager');
const Admin = require('./modules/admin');
const Hospital = require('./modules/hospital');
const Doctor = require('./modules/doctor');
const Patient = require('./modules/patient');
const Insurance = require('./modules/insurance');

async function runDemo() {
    console.log('--- Starting Enhanced Healthcare Backend Demo ---\n');

    // 1. Initialize
    DataManager.deleteAllData();
    console.log('1. System Reset & Initialized.');

    // 2. Register Patient (Hospital Role)
    console.log('\n2. Hospital registers patient Alice (P001)...');
    Hospital.registerPatient('P001', 'Alice', 'alice123');
    console.log('- Alice registered. PBC (Patient Blockchain) created.');

    // 3. Admin adds Doctor
    console.log('\n3. Admin adds Dr. Bob (DOC01)...');
    Admin.addDoctor('DOC01', 'Dr. Bob', 'bob123');
    console.log('- Dr. Bob added to users.');

    // 4. Appointment Request (Patient Role)
    console.log('\n4. Alice requests an appointment...');
    const appReq = Patient.requestAppointment('P001');
    console.log(`- Request ${appReq.requestId} logged in HBC.`);

    // 5. Approve Appointment (Hospital Role)
    console.log('\n5. Hospital approves Alice\'s appointment...');
    Hospital.handleAppointmentRequest('P001', 'APPROVED', '2024-11-10 09:00 AM');
    console.log('- Appointment approved. Logged in HBC.');

    // 6. Visit and Diagnosis (Doctor Role)
    console.log('\n6. Dr. Bob confirms Alice\'s visit and adds diagnosis...');
    Doctor.confirmPatientAttendance('DOC01', 'P001');
    const diagRes = Doctor.addDiagnosis('DOC01', 'P001', 'Seasonal Allergy', 'Antihistamines 10mg');
    console.log(`- Diagnosis added to Alice\'s PBC at block index ${diagRes.block.index}.`);

    // 7. Patient Confirmation (Patient Role)
    console.log('\n7. Alice confirms the diagnosis...');
    Patient.confirmDiagnosis('P001', diagRes.block.index);
    console.log('- Diagnosis confirmed. PBC updated.');

    // 8. Token Generation (Patient Role)
    console.log('\n8. Alice generates a LIMITED token for Insurance (ins_01)...');
    const tokenRes = Patient.generateToken('P001', 'LIMITED', 'ins_01', diagRes.block.index);
    console.log(`- Token generated: ${tokenRes.tokenId}.`);

    // 9. Access Data (Insurance Role)
    console.log('\n9. Insurance (ins_01) accesses Alice\'s diagnosis using token...');
    const accessRes = Insurance.accessData('ins_01', tokenRes.tokenId);
    if (accessRes.success) {
        console.log('- Insurance access successful.');
        console.log(`- Accessed Block Type: ${accessRes.data.type}`);
        console.log(`- Diagnosis: ${accessRes.data.data.diagnosis}`);
    } else {
        console.log(`- Access failed: ${accessRes.message}`);
    }

    // 10. Audit Log (View HBC)
    console.log('\n10. Final HBC (Hospital Blockchain) audit log check:');
    const hbc = DataManager.loadHBC();
    console.log(`- Total blocks in HBC: ${hbc.chain.length}`);
    console.log(`- Latest action: ${hbc.chain[hbc.chain.length - 1].type}`);

    // 11. Validity Check
    console.log('\n11. Validating blockchains...');
    const hbcValid = hbc.isChainValid();
    const alicePBC = DataManager.loadPBC('P001');
    const pbcValid = alicePBC.isChainValid();
    console.log(`- Hospital Blockchain Valid: ${hbcValid}`);
    console.log(`- Alice\'s Patient Blockchain Valid: ${pbcValid}`);

    console.log('\n--- Demo Completed Successfully ---');
}

runDemo().catch(err => console.error(err));
