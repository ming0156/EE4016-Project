const { createCanvas } = require('canvas');

exports.generateSpectrogram = async (inputFile, outputFile) => {
    return new Promise((resolve, reject) => {
        const canvas = createCanvas(288, 432);
        const context = canvas.getContext('2d');
        
        // Use ffmpeg to create a spectrogram image
        ffmpeg(inputFile)
            .outputOptions('-lavfi', 'showspectrumpic=s=800x400')
            .on('end', () => {
                // Save the spectrogram to the output file
                const buffer = canvas.toBuffer('image/png');
                fs.writeFileSync(outputFile, buffer);
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            })
            .save(outputFile);
    });
}