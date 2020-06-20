const express = require('express');

const transporter_controller = require('../controllers/transporterController');

const routes = express.Router();

routes.post('/thermalMonitor', transporter_controller.thermalMonitor);

routes.post('/transferBattery', transporter_controller.transferBattery);

module.exports = routes;