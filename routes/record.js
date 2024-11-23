const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { body, check, oneOf, validationResult } = require('express-validator');
const tmp = require('tmp');
const fs = require('fs');
const csv = require('csv');
const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });
const record_controller = require('../controllers/recordController');
const Gift = require('../models/gift');

//get All gift info
router.get('/health', async (req, res) => {
    let response = record_controller.health();
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

//get All gift info
router.get('/', async (req, res) => {
    let response = await record_controller.getAllGifts(req.query);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});



// csv export
// router.get('/csv', async (req, res) => {
//     let response = await record_controller.findGiftsByCSVFilter(req.query);
//     if (response.success == true) {
//         res.setHeader("Content-Disposition", "swaggerDownload=\"attachment\"; filename=\"response.csv\"");
//         console.log(response.data)
//         csv.stringify(response.data, {
//             columns: ['id', 'name', 'name_tc', 'location', 'shop name or shop id (for deleted shop)', 'type', 'display'],
//             header: true,
//             bom: true,
//             cast: {
//                 date: v => v.toISOString(),
//                 string: (v, context) => {
//                     switch (context.column) {
//                         case 'display':
//                             return v === true ? "Y" : v === false ? "N" : true;
//                         default:
//                             return v;
//                     }

//                 }
//             }
//         }).pipe(res);
//     } else {
//         res.status(500).json(response);
//     }
// });
router.get('/csv', async (req, res) => {
    let response = await record_controller.findGiftsByCSVFilter(req.query);

    if (response.success) {
        // Set response headers for CSV download
        res.setHeader("Content-Disposition", "attachment; filename=\"response.csv\"");


        // Map the response data to the desired CSV structure
        const mappedData = req.query.isGift === "true" ? response.data.map(gift => ({
            'id': gift.giftId,
            'name': gift.display_name_en,
            'name_tc': gift.display_name_zh_hant,
            'name_sc': gift.display_name_zh_hans,
            'location_id': gift.locationId,
            'shop name or shop id (for deleted shop)': gift.shop_name,
            type: gift.type,
            display: gift.display ? 'Y' : 'N' // Ensure display is in 'Y'/'N' format
        })) :
            response.data.map(gift => ({
                'id': gift.giftId,
                'name': gift.display_name_en,
                'Coupon code': gift.coupon_code,
                'name_tc': gift.display_name_zh_hant,
                'name_sc': gift.display_name_zh_hans,
                'Unit Rate': gift.unit_rate,
                'Redemption Start Date': gift.redemption_start_date
            }));

        // Log the mapped data for debugging
        // console.log(mappedData);

        // Generate CSV
        csv.stringify(mappedData, {
            header: true,
            bom: true,
            cast: {
                date: v => v.toISOString(),
                string: (v, context) => {
                    switch (context.column) {
                        case 'id':
                            return `="${req.query.isGift === "true" ? v : v.split('C')[1]}"`;
                        case 'location_id':
                        case 'Coupon code':
                            return `="${v}"`;
                        default:
                            return v;
                    }
                }
            }
        }).pipe(res);
    } else {
        res.status(500).json(response);
    }
});

// csv import Gift
router.post('/giftcsv', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "File is required" });
    }
    //console.log("Data: " + JSON.stringify(req.file));

    const csv_data_map = new Map();
    let errors = {};
    const appendError = (row, msg) => {
        if (errors[row]) {
            errors[row] += ", " + msg;
        } else {
            errors[row] = msg;
        }
    }
    const columnMapping = {
        "id": 'giftId',
        "name": 'display_name_en',
        "name_tc": 'display_name_zh_hant',
        'name_sc': 'display_name_zh_hans',
        "location_id": 'locationId',
        "shop name or shop id (for deleted shop)": 'shop_name',
        "type": 'type',
        "display": 'display'
    };
    // const columnMappingCoupon = {
    //     "id": 'giftId',
    //     "name": 'display_name_en',
    //     "Coupon code": 'coupon_code',
    //     "name_tc": 'display_name_zh_hant',
    //     "Unit Rate": 'unit_rate',
    //     "Redemption Start Date": 'redemption_start_date'
    // };

    //const columnMapping = req.isGift === "true" ? columnMappingGift : columnMappingCoupon;

    let validation_promises = [];
    const csvParser = csv.parse({
        skip_records_with_empty_values: true,
        skip_empty_lines: true,
        from: 2,
        columns: ['giftId', 'display_name_en', 'display_name_zh_hant', 'display_name_zh_hans', 'locationId', 'shop_name', 'type', 'display'],
        //columns: true,
    });
    fs.createReadStream(req.file.path, 'utf8').pipe(csvParser)
        .on('data', function (data) {
            //console.log(`check: ${JSON.stringify(data)}`)
            const rowNumber = csvParser.info.lines;
            //validation (required)
            // console.log(`check: ${JSON.stringify(data, null, 2)}`)
            //const data = {};

            // for (const [key, value] of Object.entries(data)) {
            //     if (columnMapping[key]) {
            //         data[columnMapping[key]] = value; // Map the CSV column to the desired key
            //     }
            // }
            // for (const [key, value] of Object.entries(data)) {
            //     // Check if the value contains both '=' and '"'
            //     let extractedValue = value;
            //     if (value[0] === "=") {
            //         // Extract the value inside quotes
            //         console.log("spotted: ", value)
            //         extractedValue = extractedValue.split("=")[1]
            //         extractedValue = extractedValue.split(`"`)[1];
            //         console.log(`spotted: , ${value}, ${extractedValue}`)

            //     }
            //     data[columnMapping[key]] = extractedValue; // Map the CSV column to the desired key
            //     console.log(`trasform: ${columnMapping[key]}, ${extractedValue}`)
            // }
            //console.log("test2, ", JSON.stringify(data))

            if (!data.giftId) appendError(rowNumber, "missing gift ID");
            if (!data.display_name_en) appendError(rowNumber, "missing name(EN)");
            if (!data.display_name_zh_hant) appendError(rowNumber, "missing name(TC)");
            if (!data.display_name_zh_hans) appendError(rowNumber, "missing name(SC)");
            //if (!data.locationId) appendError(rowNumber, "missing location Id");
            //if (!data.shop_name) appendError(rowNumber, "missing shop_name");
            if (!data.type) appendError(rowNumber, "missing type");
            if (!data.display) appendError(rowNumber, "missing display");

            if (data.giftId.includes("=")) {
                data.giftId = data.giftId.split("=")[1].split(`"`)[1];
            }
            if (data.locationId.includes("=")) {
                data.locationId = data.locationId.split("=")[1].split(`"`)[1];
            }

            data.display = (data.display === 'Y');
            //if (req.query.isGift === "false") data.giftId = 'C' + data.giftId;


            // validation (unique)
            // validation_promises.push(new Promise(async (resolve, reject) => {
            //     try {
            //         const exists = await record_controller.checkGiftExists(data.giftId, appendError).catch(err => reject(err));
            //         // console.log(`exists: ${exists}`)
            //         if (exists) appendError(rowNumber, `Gift ${data.giftId} already exists in database`);
            //         resolve(exists);
            //     } catch (err) {
            //         reject(err);
            //     }
            // }));

            if (csv_data_map.get(data.giftId)) appendError(rowNumber, `Gift ${data.giftId} duplicated in csv`);

            //console.log("data transforming....");
            // validation (type)
            // if (isNaN(data.greenScore)) appendError(rowNumber, "greenScore must be numeric");
            // if (isNaN(data.createdAt)) appendError(rowNumber, "createdAt must be ISO 8601 timestamp");
            // if (isNaN(data.updatedAt)) appendError(rowNumber, "updatedAt must be ISO 8601 timestamp");
            // console.log("validating....");
            // push data
            //count+=1;
            //console.log("pushing data....");
            csv_data_map.set(data.giftId, data);
        })
        .on('end', async function () {
            // remove temp file
            fs.unlink(req.file.path, () => { });
            console.log("end pushing");
            // wait until gift id unique checking is done
            console.log("waiting promise validation");
            await Promise.all(validation_promises);
            // return validateion error
            if (Object.keys(errors).length) return res.status(400).json({ success: false, message: errors });

            // insert gifts
            console.log("inserting data....");

            const csvData = Array.from(csv_data_map.values());
            // console.log('CSV Data:', JSON.stringify(csvData, null, 2)); // Pretty print with 2 spaces

            let respAddTxn;
            let respUpsertTxn;

            let sessionG;
            try {
                const dbG = mongoose.connection.useDb('epd-srs'); //gift
                sessionG = await dbG.startSession();
                sessionG.startTransaction();
                //for (const d of csvData) {
                // const giftsWithUpdatedAt = [{
                //     ...d,
                //     updatedAt: new Date(Date.now() + 28800000) // Add updatedAt field with current time
                // }];
                // console.log('CSV Data:', JSON.stringify(giftsWithUpdatedAt, null, 2));
                let i = 0;
                for (const line of csvData) {
                    respUpsertTxn = await record_controller.updateGiftById(line);
                    // if (i % 1000 === 0)
                    //     await new Promise(r => setTimeout(r, 50));
                    if (!respUpsertTxn.success) {
                        res.status(500).json(respUpsertTxn);
                        sessionG.abortTransaction();
                        return;
                    }
                    i++;
                }
                // csvData.map(async line => {
                //     respUpsertTxn = await record_controller.updateGiftById(line);
                //     if (!respUpsertTxn.success) {
                //         res.status(500).json(respUpsertTxn);
                //         sessionG.abortTransaction();
                //         return;
                //     }
                // });
                // respAddTxn = await record_controller.addGifts(sessionG, newCSVData);
                // if (!respAddTxn.success) {
                //     res.status(500).json(respAddTxn);
                //     sessionG.abortTransaction();
                //     return;
                // }
                //}

                await sessionG.commitTransaction();

                res.status(200).json({
                    success: true,
                    data: csvData
                });
            } catch (err) {
                console.log('error occurred on adding gift', err);
                if (sessionG) {
                    sessionG.abortTransaction();
                }
                res.status(500).json({ success: false, err: err });
            }
        })
        .on('error', function (err) {
            res.status(500).json({ success: false, message: err.message });
        });
});

// csv import Coupon
router.post('/couponcsv', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "File is required" });
    }
    //console.log("Data: " + JSON.stringify(req.file));

    const csv_data_map = new Map();
    let errors = {};
    const appendError = (row, msg) => {
        if (errors[row]) {
            errors[row] += ", " + msg;
        } else {
            errors[row] = msg;
        }
    }

    let validation_promises = [];
    const csvParser = csv.parse({
        skip_records_with_empty_values: true,
        skip_empty_lines: true,
        from: 2,
        columns: ['giftId', 'display_name_en', 'coupon_code', 'display_name_zh_hant', 'display_name_zh_hans', 'unit_rate', 'redemption_start_date'],
        //columns: true,
    });
    fs.createReadStream(req.file.path, 'utf8').pipe(csvParser)
        .on('data', function (data) {
            //console.log(`check: ${JSON.stringify(data)}`)
            const rowNumber = csvParser.info.lines;
            //validation (required)
            // console.log(`check: ${JSON.stringify(data, null, 2)}`)

            if (!data.giftId) appendError(rowNumber, "missing gift ID");
            if (!data.display_name_en) appendError(rowNumber, "missing name(EN)");
            if (!data.coupon_code) appendError(rowNumber, "missing coupon code");
            if (!data.display_name_zh_hant) appendError(rowNumber, "missing name(TC)");
            if (!data.display_name_zh_hans) appendError(rowNumber, "missing name(SC)");
            if (!data.unit_rate) appendError(rowNumber, "missing unit_rate");
            if (!data.redemption_start_date) appendError(rowNumber, "missing redemption_start_date");

            if (data.giftId.includes("=")) {
                data.giftId = data.giftId.split("=")[1].split(`"`)[1];
            }
            if (data.coupon_code.includes("=")) {
                data.coupon_code = data.coupon_code.split("=")[1].split(`"`)[1];
            }
            if (data.unit_rate.includes("=")) {
                data.unit_rate = data.unit_rate.split("=")[1].split(`"`)[1];
            }
            
            //data transform
            if (!data.giftId.includes("C")) {
                data.giftId = `C${data.giftId}`;
            }
            data.unit_rate = Number(data.unit_rate);
            
            // validation (unique)
            // validation_promises.push(new Promise(async (resolve, reject) => {
            //     try {
            //         const exists = await record_controller.checkGiftExists(data.giftId, appendError).catch(err => reject(err));
            //         // console.log(`exists: ${exists}`)
            //         if (exists) appendError(rowNumber, `Gift ${data.giftId} already exists in database`);
            //         resolve(exists);
            //     } catch (err) {
            //         reject(err);
            //     }
            // }));

            if (csv_data_map.get(data.giftId)) appendError(rowNumber, `Gift ${data.giftId} duplicated in csv`);

            //console.log("data transforming....");
            // validation (type)
            // if (isNaN(data.greenScore)) appendError(rowNumber, "greenScore must be numeric");
            // if (isNaN(data.createdAt)) appendError(rowNumber, "createdAt must be ISO 8601 timestamp");
            // if (isNaN(data.updatedAt)) appendError(rowNumber, "updatedAt must be ISO 8601 timestamp");
            // console.log("validating....");
            // push data
            //count+=1;
            //console.log("pushing data....");
            csv_data_map.set(data.giftId, data);
        })
        .on('end', async function () {
            // remove temp file
            fs.unlink(req.file.path, () => { });
            console.log("end pushing");
            // wait until gift id unique checking is done
            console.log("waiting promise validation");
            await Promise.all(validation_promises);
            // return validateion error
            if (Object.keys(errors).length) return res.status(400).json({ success: false, message: errors });

            // insert gifts
            console.log("inserting data....");

            const csvData = Array.from(csv_data_map.values());
            // console.log('CSV Data:', JSON.stringify(csvData, null, 2)); // Pretty print with 2 spaces

            let respAddTxn;

            let sessionG;
            try {
                
                // const dbG = mongoose.connection.useDb('epd-srs'); //gift
                // sessionG = await dbG.startSession();
                // sessionG.startTransaction();
                // // const giftsWithUpdatedAt = [{
                // //     ...d,
                // //     updatedAt: new Date(Date.now() + 28800000) // Add updatedAt field with current time
                // // }];
                // // console.log('CSV Data:', JSON.stringify(giftsWithUpdatedAt, null, 2));
                // respAddTxn = await record_controller.addGifts(sessionG, csvData);
                // if (!respAddTxn.success) {
                //     res.status(500).json(respAddTxn);
                //     sessionG.abortTransaction();
                //     return;
                // }
                const dbG = mongoose.connection.useDb('epd-srs'); //gift
                sessionG = await dbG.startSession();
                sessionG.startTransaction();
                //for (const d of csvData) {
                // const giftsWithUpdatedAt = [{
                //     ...d,
                //     updatedAt: new Date(Date.now() + 28800000) // Add updatedAt field with current time
                // }];
                // console.log('CSV Data:', JSON.stringify(giftsWithUpdatedAt, null, 2));
                let i = 0;
                for (const line of csvData) {
                    respUpsertTxn = await record_controller.updateGiftById(line);
                    // if (i % 1000 === 0)
                    //     await new Promise(r => setTimeout(r, 50));
                    if (!respUpsertTxn.success) {
                        res.status(500).json(respUpsertTxn);
                        sessionG.abortTransaction();
                        return;
                    }
                    i++;
                }

                await sessionG.commitTransaction();

                res.status(200).json({
                    success: true,
                    data: csvData
                });
            } catch (err) {
                console.log('error occurred on adding gift', err);
                if (sessionG) {
                    sessionG.abortTransaction();
                }
                if (sessionG) {
                    sessionG.abortTransaction();
                }
                res.status(500).json({ success: false, err: err });
            }
        })
        .on('error', function (err) {
            res.status(500).json({ success: false, message: err.message });
        });
});

//add gift
router.post('/',
    // body('giftId').not().isEmpty()
    //     .withMessage('Gift Id cannot be empty'),
    // body('display_name_zh_hant').not().isEmpty()
    //     .withMessage('Name(TC) cannot be empty'),
    // body('display_name_zh_hans').not().isEmpty()
    //     .withMessage('Name(TS) cannot be empty'),
    // body('display_name_en').not().isEmpty()
    //     .withMessage('Name(EN) cannot be empty'),
    // body('greenScore').not().isEmpty().withMessage('greenScore cannot be empty').isFloat({ min: 0 }).withMessage('greenScore must be a number greater than 0'),
    // body('description').not().isEmpty()
    //     .withMessage('description cannot be empty'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        let response = await record_controller.addGift(req.body);
        console.log(`rutes`, req.body)

        if (response.success == true) {
            res.status(200).json(response);
        } else {
            res.status(404).json(response);
        }
    });

//get All gift by id
router.get('/:giftId', async (req, res) => {
    console.log(req.params.giftId)
    let response = await record_controller.getGiftById(req.params.giftId);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

//update gift info
router.put('/',
    // body('giftId').not().isEmpty()
    //     .withMessage('Gift Id cannot be empty'),
    // body('display_name_zh_hant').not().isEmpty()
    //     .withMessage('Name(TC) cannot be empty'),
    // body('display_name_zh_hans').not().isEmpty()
    //     .withMessage('Name(TS) cannot be empty'),
    // body('display_name_en').not().isEmpty()
    //     .withMessage('Name(EN) cannot be empty'),
    // body('greenScore').not().isEmpty().withMessage('greenScore cannot be empty').isFloat({ min: 0 }).withMessage('greenScore must be a number greater than 0'),
    // body('description').not().isEmpty()
    //     .withMessage('description cannot be empty'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        //only allow to change username and role only
        let response = await record_controller.updateGiftById(req.body);
        if (response.success == true) {
            res.status(200).json(response);
        } else {
            res.status(404).json(response);
        }
    });

//remove gift    
router.delete('/:giftId', async (req, res) => {
    let response = await record_controller.removeGiftById(req.params.giftId);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});


module.exports = router;
