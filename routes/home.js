const express = require('express');
const router = express.Router();
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const upload = multer({ dest: 'tmp/image/' });
let home_controller = require('../controllers/homeController');

router.post('/importmp3', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "File is required" });
    }
    const mp3FilePath = req.file.path;
    const spectrogramFilePath = `uploads/${req.file.filename}.png`;

    // Convert MP3 to WAV using ffmpeg
    const wavFilePath = `uploads/${req.file.filename}.wav`;

    ffmpeg(mp3FilePath)
        .toFormat('wav')
        .on('end', () => {
            console.log('Conversion to WAV completed. Generating spectrogram...');
            home_controller.generateSpectrogram(wavFilePath, spectrogramFilePath)
                .then(() => {
                    // Clean up files
                    fs.unlinkSync(mp3FilePath);
                    fs.unlinkSync(wavFilePath);
                    res.json({ success: true, spectrogram: spectrogramFilePath });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ success: false, message: "Failed to generate spectrogram" });
                });
        })
        .on('error', (err) => {
            console.error(err);
            res.status(500).json({ success: false, message: "Failed to convert MP3" });
        })
        .save(wavFilePath);
});
module.exports = router;
