const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.json({
            navigation: true,
            home: true,
            record: true,
        });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
