const express = require('express');
const router = express.Router();

const home = require('./home');
const hello = require('./hello');
const menuItem = require('./menuItem');
const record = require('./record');
const version = require('./version')

router.use('/hello', hello);
router.use('/home', home);
router.use('/menuItem', menuItem);
router.use('/gift', record);
router.use('/version', version)

module.exports = router;