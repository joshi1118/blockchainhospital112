# Terminal-Based Healthcare Backend System with Custom Blockchain

This project implements a dual-blockchain system for healthcare operations, including audit logging and role-based access control.

## 🔐 Confidential Credentials

The following credentials are used for initial access and system administration:

### **ADMIN ROLE**
- **Admin ID:** `admin`
- **Admin Password:** `secure_admin_password_123` (Configured in `config.json`)

### **HOSPITAL ROLE (System Account)**
- **Hospital ID:** `hospital_01`
- **Hospital Password:** `hospital123` (Default)

### **INSURANCE ROLE**
- **Insurance ID:** `ins_01`
- **Insurance Password:** `insurance123` (Default)

---

## 🚀 How to Run

### **1. Interactive CLI**
To start the main application and interact via the terminal:
```bash
node app.js
```

### **2. Automated Demo**
To see a full end-to-end workflow (registration, appointment, diagnosis, token usage, and validation):
```bash
node demo.js
```

## 🧱 Blockchain Architecture
- **Hospital Blockchain (HBC):** Global chain for public operational logs and audit trails.
- **Patient Blockchain (PBC):** Private per-patient record chain for medical history.

## 📁 Project Structure
- `/blockchain`: Core block and blockchain logic.
- `/modules`: Role-specific logic (Admin, Hospital, Doctor, Patient, Insurance, Token, Delete).
- `/data`: JSON file persistence (auto-generated).
