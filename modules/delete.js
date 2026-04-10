const DataManager = require('./dataManager');
const fs = require('fs');
const path = require('path');

class Delete {
    static deleteAllData(adminPassword) {
        const configPath = path.join(__dirname, '../config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        if (adminPassword === config.ADMIN_PASSWORD) {
            DataManager.deleteAllData();
            return { success: true, message: 'All data deleted and system reinitialized.' };
        } else {
            return { success: false, message: 'Incorrect admin password. Action denied.' };
        }
    }
}

module.exports = Delete;
