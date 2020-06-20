const crypto = require('crypto');
const ethUtil = require('ethereumjs-util');

exports.randomString = (size, _possible) => {
    let text = "";
    const possible = _possible || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < size; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.randomInt = (min, max) => {
    return parseInt(Math.random() * (max - min) + min);
}

exports.randomFloat = (min, max) => {
    return Math.random() * (max - min) + min;
}

exports.randomLocation = () => {
    const lat = this.randomFloat(-90, 90).toFixed(8);
    const long = this.randomFloat(-180, 180).toFixed(8);

    const location = lat + ';' + long;

    return ethUtil.bufferToHex(Buffer.from(location));
}

exports.randomSerialNumber = () => {
    const serialNumber = this.randomString(1, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') + this.randomString(5, '0123456789');
    return ethUtil.bufferToHex(Buffer.from(serialNumber));
}

exports.randomAddress = () => {

    // Ensure the private key is valid
    let privateKey = crypto.randomBytes(32);
    while (!ethUtil.isValidPrivate(privateKey)) {
        privateKey = crypto.randomBytes(32);
    }

    // Get the public key based on the private key
    const publicKey = ethUtil.privateToPublic(privateKey);

    // Hash the public key and take the last 20 bytes of the hash
    let address = ethUtil.keccak256(publicKey).slice(12);

    // Encode as hexadecimal
    address = ethUtil.bufferToHex(address);

    return address;
}

exports.newDistributor = (name, password, address) => {
    return {
        name: name || this.randomString(10),
        password: password || this.randomString(15),
        address: address || this.randomAddress()
    }
}