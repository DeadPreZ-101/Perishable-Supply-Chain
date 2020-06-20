const web3 = require('web3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Distributor = require('../models/distributor');
const connectionWeb3 = require('../connectionWeb3');

exports.index = (req, res, next) => {

    Distributor
        .find()
        .sort([['address', 'ascending'], ['name']])
        .exec(function (err, distributors) {
            if (err) { return next(err); }
            res.json(distributors);
        });
}

exports.create = (req, res, next) => {

    const distributor = new Distributor(
        {
            name: req.body.name,
            password: req.body.password,
            address: req.body.address,
            registration_date: req.body.registration_date
        });

    distributor.save(function (err, doc) {
        if (err) { return next(err); }
        res.status(201).json({ id: doc.id, message: `Distributor ${doc.name} created successfully` });
    });
}

exports.login = async (req, res) => {

    const name = req.body.name;
    const password = req.body.password;

    if (!name || !password) {
        return res.status(401).json({ message: 'Invalid name/password' });
    }

    const distributor = await Distributor.findOne({ name });
    if (!distributor) {
        return res.status(401).json({ message: 'Invalid name' });
    }

    const isMatch = await bcrypt.compare(password, distributor.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const distributorJWT = jwt.sign({ name }, process.env.PRIVATE_KEY, { algorithm: 'HS256' });

    res.status(200).json({ distributorJWT, address: distributor.address });
}

exports.getBatteries = async (req, res) => {
    const distributor = await Distributor.findOne({ address: req.cookies.address });
    if (!distributor) {
        return res.status(401).json({ message: 'User not found' });
    }

    res.status(200).json({ batteries: distributor.batteries });
}

exports.orderBattery = (req, res, next) => {
    connectionWeb3
        .orderBattery(req.cookies.address, req.params.tokenId)
        .then(() => {
            res.json({ message: `Battery ${req.params.tokenId} ordered successfully` });
        })
        .catch(err => {
            return next(err);
        });
}

exports.getBatteryTrackingInfo = (req, res, next) => {
    connectionWeb3
        .getBatteryTrackingInfo(req.cookies.address, req.params.tokenId)
        .then((info) => {
            res.json({
                thermal: info[0],
                location: web3.utils.toAscii(info[1]).replace(/\0/g, '').split(';'),
                currentOwner: info[2]
            });
        })
        .catch(err => {
            return next(err);
        });
}