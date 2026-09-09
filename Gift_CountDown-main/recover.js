const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\35b42dfd-3156-4b0b-9702-d44fb33acc39\\.system_generated\\logs\\transcript_full.jsonl';
const recoveredLines = {};

function findStrings(d) {
    if (typeof d === 'string') {
        const regex = /^(\d+): (.*)$/gm;
        let match;
        while ((match = regex.exec(d)) !== null) {
            recoveredLines[parseInt(match[1])] = match[2];
        }
    } else if (Array.isArray(d)) {
        d.forEach(findStrings);
    } else if (typeof d === 'object' && d !== null) {
        Object.values(d).forEach(findStrings);
    }
}

async function processLineByLine() {
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            findStrings(data);
        } catch (e) {
            // Ignore parse errors
        }
    }

    let out = '';
    for (let i = 989; i <= 1980; i++) {
        if (recoveredLines[i] !== undefined) {
            out += recoveredLines[i] + '\n';
        } else {
            out += '// MISSING LINE ' + i + '\n';
        }
    }
    fs.writeFileSync('recovered.js', out, 'utf8');
    console.log('Recovered ' + Object.keys(recoveredLines).length + ' lines.');
}

processLineByLine();
