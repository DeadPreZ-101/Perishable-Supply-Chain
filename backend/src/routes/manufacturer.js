const express = require('express');

const manufacturer_controller = require('../controllers/manufacturerController');

const routes = express.Router();

routes.post('/transferBattery', manufacturer_controller.transferBattery);

routes.post('/makeBattery', manufacturer_controller.makeBattery);

module.exports = routes;