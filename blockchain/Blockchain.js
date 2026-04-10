const Block = require('./block');

class Blockchain {
    constructor(type = 'GENERAL', genesisData = { message: 'Genesis Block' }) {
        this.type = type;
        this.chain = [this.createGenesisBlock(genesisData)];
    }

    createGenesisBlock(data) {
        return new Block(0, new Date().toISOString(), 'GENESIS', data, '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(type, data) {
        const latestBlock = this.getLatestBlock();
        const newBlock = new Block(
            this.chain.length,
            new Date().toISOString(),
            type,
            data,
            latestBlock.hash
        );
        this.chain.push(newBlock);
        return newBlock;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verify current block hash
            if (currentBlock.hash !== this.recalculateBlockHash(currentBlock)) {
                return false;
            }

            // Verify link to previous block
            if (currentBlock.previous_hash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    recalculateBlockHash(block) {
        const tempBlock = new Block(
            block.index,
            block.timestamp,
            block.type,
            block.data,
            block.previous_hash
        );
        return tempBlock.hash;
    }

    // Load from array of blocks
    static fromJSON(blocks) {
        const blockchain = new Blockchain();
        blockchain.chain = blocks.map(b => {
            const block = new Block(b.index, b.timestamp, b.type, b.data, b.previous_hash);
            block.hash = b.hash;
            return block;
        });
        return blockchain;
    }
}

module.exports = Blockchain;
