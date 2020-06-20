const express = require('express');

const distributor_controller = require('../controllers/distributorController');
const { checkLogin } = require('../middlewares/auth');
const distributor_validator = require('../middlewares/distributorValidator');
const { validate } = require('../middlewares/validate');

const routes = express.Router();

routes.get('/', distributor_controller.index);

routes.get('/index', distributor_controller.index);

routes.post('/new', distributor_validator.registration, validate, distributor_controller.create);

routes.post('/login', distributor_validator.login, validate, distributor_controller.login);

routes.get('/getBatteries', distributor_controller.getBatteries);

routes.get('/orderBattery/:tokenId', checkLogin, distributor_controller.orderBattery);

routes.get('/batteryInfo/:tokenId', checkLogin, distributor_controller.getBatteryTrackingInfo);

module.exports = routes;