const express = require('express');
const router = express.Router();
const Package = require('../package.json');

router.get('/', async (req, res) => {
    res.status(200).json({ version: Package.version })
})

module.exports = router