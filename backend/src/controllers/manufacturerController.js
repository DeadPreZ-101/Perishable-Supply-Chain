const connectionWeb3 = require('../connectionWeb3');

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

exports.makeBattery = (req, res, next) => {

    const manufacturerAddress = req.cookies.manufacturerAddress;
    const _manufacturer = req.body._manufacturer;
    const _serialno = Buffer.from(req.body._serialno);
    const _thermal = parseInt(req.body._thermal);
    const _location = Buffer.from(Object.values(req.body._location).toString().replace(',', ';'));

    connectionWeb3
        .makeBattery(manufacturerAddress, _manufacturer, _serialno, _thermal, _location)
        .then(() => {
            res.json({ message: "Battery token minted successfully" });
        })
        .catch(err => {
            return next(err);
        });
}