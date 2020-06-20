const Web3 = require('web3');
const BigNumber = require('bignumber.js')

const addressJSON = require('../../smart_contract/build/SupplyChainAddress.json');
const contractJSON = require('../../smart_contract/build/contracts/SupplyChain.json');

const CONTRACT_ADDRESS = addressJSON.address;
const CONTRACT_ABI = contractJSON.abi;

let web3;
let contract;

(async () => {
    web3 = new Web3(process.env.BLOCKCHAIN_EMULATOR_URI);
    const accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, { from: accounts[0] });
})();

const connectionWeb3 = {

    async addManufacturer(adminAddress, manufacturerAddress) {
        return await contract.methods
            .addManufacturer(manufacturerAddress)
            .send({ from: adminAddress });
    },

    async addTransporter(adminAddress, transporterAddress) {
        return await contract.methods
            .addTransporter(transporterAddress)
            .send({ from: adminAddress });
    },

    async addDistributor(adminAddress, distributorAddress) {
        return await contract.methods
            .addDistributor(distributorAddress)
            .send({ from: adminAddress });
    },

    async makeBattery(manufacturerAddress, _manufacturer, _serialno, _thermal, _location) {
        return await contract.methods
            .makeBattery(_manufacturer, _serialno, _thermal, _location)
            .send({ from: manufacturerAddress, gas: 500000 });
    },

    async orderBattery(distributorAddress, _id) {
        return await contract.methods
            .orderBattery(new BigNumber(_id))
            .send({ from: distributorAddress });
    },

    async thermalMonitor(currentOwnerAddress, _id, _thermal, _location) {
        return await contract.methods
            .thermalMonitor(_id, _thermal, _location)
            .send({ from: currentOwnerAddress });
    },

    async transferBattery(currentOwnerAddress, _id, _to, _thermal, _location) {
        return await contract.methods
            .transferBattery(new BigNumber(_id), _to, _thermal, _location)
            .send({ from: currentOwnerAddress });
    },

    async getBatteryTrackingInfo(distributorAddress, tokenId) {
        return await contract.methods
            .getBatteryTrackingInfo(new BigNumber(tokenId))
            .call({ from: distributorAddress });
    }
}

module.exports = connectionWeb3;