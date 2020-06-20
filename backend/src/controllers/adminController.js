const connectionWeb3 = require('../connectionWeb3');

exports.addManufacturer = (req, res, next) => {
    connectionWeb3
        .addManufacturer(req.cookies.adminAddress, req.body.manufacturerAddress)
        .then(() => {
            res.json({ message: "Manufacturer added successfully" });
        })
        .catch(err => {
            return next(err);
        });
}

exports.addTransporter = (req, res, next) => {
    connectionWeb3
        .addTransporter(req.cookies.adminAddress, req.body.transporterAddress)
        .then(() => {
            res.json({ message: "Transporter added successfully" });
        })
        .catch(err => {
            return next(err);
        });
}

exports.addDistributor = (req, res, next) => {
    connectionWeb3
        .addDistributor(req.cookies.adminAddress, req.body.distributorAddress)
        .then(() => {
            res.json({ message: "Distributor added successfully" });
        })
        .catch(err => {
            return next(err);
        });
}