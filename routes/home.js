const express = require('express');
const router = express.Router();
const csv = require('csv');
let home_controller = require('../controllers/homeController');

router.get('/count', async (req, res) => {
    let response = await home_controller.getCount();
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

router.get('/csv', async (req, res) => {
    let response = '';
    response = await home_controller.getAllMembers(req.query);
    if (response.success == true) {
        res.setHeader("Content-Disposition", "swaggerDownload=\"attachment\"; filename=\"member.csv\"");
        csv.stringify(response.data, {
            columns: [
                'memberID',
                'username',
                'transferedFromID',
                'membership',
                'balance',
                'bonus',
                'redemptionTotal',
                'address',
                'district',
                'gender',
                'bday',
                'tel',
                'email',
                'buildingType',
                'occupation',
                'remarks',
                'updateAt',
                'createAt',
                'qtyBAT',
                'qtyBook',
                'qtyCloth',
                'qtyFLT',
                'qtyFoodWaste',
                'qtyGlassBottle',
                'qtyMetal1',
                'qtyMetal2',
                'qtyPlastic1',
                'qtyPlastic2',
                'qtyREE',
                'qtySEA',
                'qtyToner',
                'qtyTP',
                'qtyWP1',
                'qtyWP2',
                'qtyWP3',
                'qtyMISC1',
                'qtyMISC2',
                'qtyMISC3',
                'qtyMISC4',
                'qtyMISC5',
                'qtyMISC6',
                'qtyMISC7',
                'qtyMISC8'
            ],
            header: true,
            cast: {
                date: v => v.toISOString(),
                string: (v, context) => {
                    switch (context.column) {
                        case 'memberID':
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

module.exports = router;
