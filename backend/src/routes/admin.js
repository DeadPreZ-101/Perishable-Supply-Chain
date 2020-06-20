const express = require('express');

const admin_controller = require('../controllers/adminController');

const routes = express.Router();

routes.post('/addManufacturer', admin_controller.addManufacturer);

routes.post('/addTransporter', admin_controller.addTransporter);

routes.post('/addDistributor', admin_controller.addDistributor);

module.exports = routes;