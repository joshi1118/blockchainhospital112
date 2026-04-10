const crypto = require('crypto');

class Block {
    constructor(index, timestamp, type, data, previous_hash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.type = type;
        this.data = data;
        this.previous_hash = previous_hash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                this.index +
                this.timestamp +
                this.type +
                JSON.stringify(this.data) +
                this.previous_hash
            )
            .digest('hex');
    }
}

module.exports = Block;
