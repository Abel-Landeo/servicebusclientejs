const fs = require('fs');
const readline = require('readline');
const path = require('path');
const events = require('events');

/**
 * 
 * @param {String} jsonPath 
 * @returns {Promise<Object[]>}
 */
async function loadJsonFile(jsonPath) {
    let ext = path.extname(jsonPath);
    let items;
    if (ext === '.json') {
        items = require(jsonPath);
    } else if (ext === '.jsonl') {
        items = [];
        let frs = fs.createReadStream(jsonPath);
        const rl = readline.createInterface({
            input: frs,
            crlfDelay: Infinity
        });

        rl.on('line', jsonLine => {
            items.push(JSON.parse(jsonLine));
        });
        await events.once(rl, 'close');
    }
    return items;
}

module.exports = {
    loadJsonFile
}