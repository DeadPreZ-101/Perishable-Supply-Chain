const connectionWeb3 = require('../connectionWeb3');

exports.thermalMonitor = (req, res, next) => {

    const currentOwnerAddress = req.cookies.transporterAddress;
    const _id = req.body._id;
    const _thermal = parseInt(req.body._thermal);
    const _location = Buffer.from(Object.values(req.body._location).toString().replace(',', ';'));

    connectionWeb3
        .thermalMonitor(currentOwnerAddress, _id, _thermal, _location)
        .then(() => {
            res.json({ message: `Battery token ${req.body._id} transfered successfully` });
        })
        .catch(err => {
            return next(err);
        });
}

exports.transferBattery = (req, res, next) => {

    const currentOwnerAddress = req.cookies.manufacturerAddress;
    const _id = req.body._id;
    const _to = req.body._to;
    const _thermal = parseInt(req.body._thermal);
    const _location = Buffer.from(Object.values(req.body._location).toString().replace(',', ';'));

    connectionWeb3
        .transferBattery(currentOwnerAddress, _id, _to, _thermal, _location)
        .then(() => {
            res.json({ message: `Battery token ${req.body._id} transfered successfully` });
        })
        .catch(err => {
            return next(err);
        });
}