require('dotenv').config();

const Web3 = require('web3');
const async = require('async');
const mongoose = require('mongoose');

const randomGenerator = require('./utils/randomGenerator');
const Distributor = require('./models/distributor');

const InitiateMongoServer = require('./db/connection');
const mongoURI = process.env.MONGODB_URI_DEV;

InitiateMongoServer(mongoURI, true);

const addressJSON = require('../../smart_contract/build/SupplyChainAddress.json');
const contractJSON = require('../../smart_contract/build/contracts/SupplyChain.json');
const CONTRACT_ADDRESS = addressJSON.address;
const CONTRACT_ABI = contractJSON.abi;

let web3;
let accounts;
let contract;

let admin;
let manufacturer;
let transporter1;
let transporter2;
let distributor;

const numOfBatteries = 3;

async function initSmartContractData() {

    web3 = new Web3(process.env.BLOCKCHAIN_EMULATOR_URI);
    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, { from: accounts[0] });

    admin = accounts[0];
    manufacturer = accounts[1];
    transporter1 = accounts[2];
    transporter2 = accounts[3];
    distributor = accounts[4];
}

function populateRoles(cb) {
    async.series([
        (cb) => {
            contract.methods
                .addManufacturer(manufacturer)
                .send({ from: admin })
                .then(() => {
                    console.log(`Added manufacturer: ${manufacturer}`);
                })
                .catch(err => {
                    console.log('Ooppss... addManufacturer', err);
                })
                .finally(() => cb())
        },
        (cb) => {
            contract.methods
                .addTransporter(transporter1)
                .send({ from: admin })
                .then(() => {
                    console.log(`Added transporter: ${transporter1}`);
                })
                .catch(err => {
                    console.log('Ooppss... addTransporter', err);
                })
                .finally(() => cb())
        },
        (cb) => {
            contract.methods
                .addDistributor(distributor)
                .send({ from: admin })
                .then(() => {
                    console.log(`Added distributor: ${distributor}`);
                })
                .catch(err => {
                    console.log('Ooppss...addDistributor', err);
                })
                .finally(() => cb())
        }
    ], cb)
}


function populateBatteries(cb) {
    let batteryArray = []
    for (let i = 0; i < numOfBatteries; i++) {
        batteryArray.push(
            (cb) => {
                const location = randomGenerator.randomLocation();
                contract.methods
                    .makeBattery(
                        randomGenerator.randomString(10),
                        randomGenerator.randomSerialNumber(),
                        randomGenerator.randomInt(10, 20),
                        location
                    )
                    .send({ from: manufacturer, gas: 500000 })
                    .then(() => {
                        console.log(`Battery ${i} created`);
                    })
                    .catch(err => {
                        console.log(`OOppss...makeBattery ${i}`, err);
                    })
                    .finally(() => cb())
            }
        )
    }

    async.series(batteryArray, cb);
}

function orderBatteries(cb) {
    let orderArray = []
    for (let i = 0; i < numOfBatteries; i++) {
        orderArray.push(
            (cb) => {
                contract.methods
                    .orderBattery(i)
                    .send({ from: distributor })
                    .then(() => {
                        console.log(`Battery ${i} ordered by distributor ${distributor}`);
                    })
                    .catch(err => {
                        console.log(`OOppss...orderBattery ${i}`, err);
                    })
                    .finally(() => cb());
            }
        )
    }

    async.series(orderArray, cb)
}

function transferBatteries(cb) {
    let transferArray = []
    for (let i = 0; i < numOfBatteries - 1; i++) {
        transferArray.push(
            (cb) => {
                contract.methods
                    .transferBattery(
                        i,
                        transporter1,
                        randomGenerator.randomInt(10, 20),
                        randomGenerator.randomLocation()
                    )
                    .send({ from: manufacturer })
                    .then(() => {
                        console.log(`Battery ${i} transfered to transporter ${transporter1}`);
                    })
                    .catch(err => {
                        console.log(`OOppss...transferBattery ${i}`, err);
                    })
                    .finally(() => cb())
            }
        )
    }

    async.series([
        ...transferArray,
        (cb) => {
            contract.methods
                .transferBattery(
                    2,
                    transporter1,
                    randomGenerator.randomInt(10, 20),
                    randomGenerator.randomLocation()
                )
                .send({ from: manufacturer })
                .then(() => {
                    console.log(`Battery 2 transfered to transporter ${transporter2}`);
                })
                .catch(err => {
                    console.log('OOppss...transferBattery 2', err);
                })
                .finally(() => cb())
        }
    ], cb)
}

function getInfoBatteries(cb) {
    let infoArray = []
    for (let i = 0; i < numOfBatteries; i++) {
        infoArray.push(
            (cb) => {
                contract.methods
                    .getBatteryTrackingInfo(0)
                    .call({ from: distributor })
                    .then((info) => {
                        console.log(`Info from battery ${i}: ${info}`);
                        console.log(info);
                    })
                    .catch(err => {
                        console.log(`OOppss...getBatteryTrackingInfo ${i}`, err);
                    })
                    .finally(() => cb())
            }
        )
    }

    async.series(infoArray, cb)
}

function distributorCreate({ name, password, address, batteries }, cb) {
    const newDistributor = new Distributor({ name, password, address, batteries });

    newDistributor.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New distributor: ' + newDistributor.name);
        cb(null, newDistributor)
    });
}

function populateDistributors(cb) {
    async.parallel([
        cb => distributorCreate({
            name: "distributor",
            password: 123456,
            address: distributor,
            batteries: [0, 1, 2]
        }, cb)
    ], cb);
}

function deleteDatabse(cb) {
    console.log('Deleting database');
    mongoose.connection.dropDatabase();
    console.log('Detabase deleted');
    cb();
}

async.series([
    initSmartContractData,
    populateRoles,
    populateBatteries,
    orderBatteries,
    transferBatteries,
    // getInfoBatteries,
    deleteDatabse,
    populateDistributors
],
    function (err) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        }
        else {
            console.log('Success');
        }
        mongoose.connection.close();
    });