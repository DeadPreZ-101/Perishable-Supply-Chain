const ethUtil = require('ethereumjs-util');
const crypto = require('crypto');
const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");

const randomGenerator = require('./randomGenerator');

const SupplyChain = artifacts.require("SupplyChain");

contract("Contract Test", (accounts) => {
    const addressZero = "0x0000000000000000000000000000000000000000";
    const admin = accounts[0];
    const manufacturer = accounts[1];
    const transporter1 = accounts[2];
    const transporter2 = accounts[3];
    const distributor = accounts[4];

    const MANUFACTURER_ROLE = "0xeefb95e842a3287179d933b4460be539a1d5af11aa8b325bb45c5c8dc92de4ed";
    const TRANSPORT_ROLE = "0xb82a77b83aa57abb9bcfbacbdfb3201de26ecd2b35d0d6cf6c3b9bb2cb7026c4";
    const DISTRIBUTOR_ROLE = "0xfbd454f36a7e1a388bd6fc3ab10d434aa4578f811acbbcf33afb1c697486313c";

    let contractInstance;

    // Deploy a new contract before each test to prevent one test from interfering with the other
    beforeEach(async () => {
        contractInstance = await SupplyChain.new('', { from: admin });
    });

    describe('01 - Add roles', () => {
        it('A - should be able to add manufacturer', async () => {
            const tx = await contractInstance.addManufacturer(manufacturer, { from: admin });

            truffleAssert.eventEmitted(tx, "RoleGranted", (obj) => {
                return (
                    obj.role == MANUFACTURER_ROLE &&
                    obj.account === manufacturer &&
                    obj.sender == admin
                )
            }, 'Fail RoleGranted event');
        });

        it('B - should be able to add transporter', async () => {
            const tx = await contractInstance.addTransporter(transporter1, { from: admin });

            truffleAssert.eventEmitted(tx, "RoleGranted", (obj) => {
                return (
                    obj.role == TRANSPORT_ROLE &&
                    obj.account === transporter1 &&
                    obj.sender == admin
                )
            }, 'Fail RoleGranted event');
        });

        it('C - should be able to add distributor', async () => {
            const tx = await contractInstance.addDistributor(distributor, { from: admin });

            truffleAssert.eventEmitted(tx, "RoleGranted", (obj) => {
                return (
                    obj.role == DISTRIBUTOR_ROLE &&
                    obj.account === distributor &&
                    obj.sender == admin
                )
            }, 'Fail RoleGranted event');
        });
    })

    describe('02 - Battery life cycle', () => {
        it('A - should mint a new battery token', async () => {
            await contractInstance.addManufacturer(manufacturer, { from: admin });

            const tx = await contractInstance.makeBattery(
                randomGenerator.randomString(10),
                crypto.randomBytes(6),
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            truffleAssert.eventEmitted(tx, "Transfer", (obj) => {
                return (
                    obj._from === addressZero &&
                    obj._to === manufacturer &&
                    new BigNumber(0).isEqualTo(obj._tokenId)
                )
            }, 'Fail Transfer in battery token minting');
        });

        it('B - should be able to transfer battery token to a transporter', async () => {
            await contractInstance.addManufacturer(manufacturer, { from: admin });
            await contractInstance.addTransporter(transporter1, { from: admin });

            await contractInstance.makeBattery(
                randomGenerator.randomString(10),
                crypto.randomBytes(6),
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            const tx = await contractInstance.transferBattery(
                0,
                transporter1,
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            truffleAssert.eventEmitted(tx, "Transfer", (obj) => {
                return (
                    obj._from === manufacturer &&
                    obj._to === transporter1 &&
                    new BigNumber(0).isEqualTo(obj._tokenId)
                )
            }, 'Fail Transfer in battery token transfer from manufacturer to transporter');
        });

        it('C - should be able to transfer battery token to another transporter', async () => {
            await contractInstance.addManufacturer(manufacturer, { from: admin });
            await contractInstance.addTransporter(transporter1, { from: admin });
            await contractInstance.addTransporter(transporter2, { from: admin });

            await contractInstance.makeBattery(
                randomGenerator.randomString(10),
                crypto.randomBytes(6),
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            await contractInstance.transferBattery(
                0,
                transporter1,
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            const tx = await contractInstance.transferBattery(
                0,
                transporter2,
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: transporter1 }
            )

            truffleAssert.eventEmitted(tx, "Transfer", (obj) => {
                return (
                    obj._from === transporter1 &&
                    obj._to === transporter2 &&
                    new BigNumber(0).isEqualTo(obj._tokenId)
                )
            }, 'Fail Transfer in battery token transfer from transporter 1 to transporter 2');
        });

        it('D - should be able to transfer battery token from transporter to distributor', async () => {
            await contractInstance.addManufacturer(manufacturer, { from: admin });
            await contractInstance.addTransporter(transporter1, { from: admin });
            await contractInstance.addDistributor(distributor, { from: admin });

            await contractInstance.makeBattery(
                randomGenerator.randomString(10),
                crypto.randomBytes(6),
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            await contractInstance.orderBattery(0, { from: distributor });

            await contractInstance.transferBattery(
                0,
                transporter1,
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            const tx = await contractInstance.transferBattery(
                0,
                distributor,
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: transporter1 }
            )

            truffleAssert.eventEmitted(tx, "Transfer", (obj) => {
                return (
                    obj._from === transporter1 &&
                    obj._to === distributor &&
                    new BigNumber(0).isEqualTo(obj._tokenId)
                )
            }, 'Fail Transfer in battery token transfer from transporter to distributor');
        });
    });

    describe('03 - Battery data', () => {
        it('A - should change battery info', async () => {
            const newThermal = randomGenerator.randomNumber(10, 20);
            const newLocation = crypto.randomBytes(26);

            await contractInstance.addManufacturer(manufacturer, { from: admin });
            await contractInstance.addTransporter(transporter1, { from: admin });
            await contractInstance.addDistributor(distributor, { from: admin });

            await contractInstance.makeBattery(
                randomGenerator.randomString(10),
                crypto.randomBytes(6),
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            await contractInstance.orderBattery(0, { from: distributor });

            await contractInstance.transferBattery(
                0,
                transporter1,
                randomGenerator.randomNumber(10, 20),
                crypto.randomBytes(26),
                { from: manufacturer }
            )

            await contractInstance.thermalMonitor(
                0,
                newThermal,
                newLocation,
                { from: transporter1 }
            )

            const info = await contractInstance.getBatteryTrackingInfo(0, { from: distributor });

            assert.equal(info[0], newThermal, `Current termal should be ${newThermal}`);
            assert.equal(info[1], ethUtil.bufferToHex(newLocation), `Current location should be ${newLocation}`);
            assert.equal(info[2], transporter1, `Current transporter should be ${transporter1}`);
        });
    })
});