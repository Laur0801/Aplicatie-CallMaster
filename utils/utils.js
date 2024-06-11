const { promisify } = require('util');
const fs = require('fs').promises;
const exec = promisify(require('child_process').exec);
const crypto = require('crypto');

async function toBase64(text) {
    const buffer = Buffer.from(text);
    return buffer.toString('base64');
}

async function fromBase64(text) {
    const buffer = Buffer.from(text, 'base64');
    return buffer.toString('ascii');
}

async function fileToStrings(filename) {
    const data = await fs.readFile(filename, 'binary');
    return data.split('\n');
}

async function convertMP3toWAV(oldPath, newPath) {
    try {
        await exec(`lame --decode ${oldPath} - | sox -v 0.5 -t wav - -t wav -b 16 -r 8000 -c 1 ${newPath}`);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function checkIfPathExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch (error) {
        return false;
    }
}

async function createFileIfNotExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch (error) {
        await fs.writeFile(path, '');
        return true;
    }
}

async function sha256(string) {
    const hash = crypto.createHash('sha256');
    hash.update(string);
    return hash.digest('hex');
}

module.exports = {
    toBase64,
    fromBase64,
    fileToStrings,
    convertMP3toWAV,
    checkIfPathExists,
    createFileIfNotExists,
    sha256
};
