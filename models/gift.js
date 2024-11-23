const mongoose = require("mongoose");
const db = mongoose.connection.useDb("epd-srs");
const Schema = mongoose.Schema;

const GiftSchema = new Schema({
    giftId: {
        type: String,
    },
    display_name_en: {
        type: String,
    },
    display_name_zh_hant: {
        type: String,
    },
    display_name_zh_hans: {
        type: String,
    },
    //Gift
    locationId: {
        type: String,
    },
    shop_name: {
        type: String,
    },
    type: {
        type: String,
    },
    display: {
        type: Boolean,
    },
    //Coupon
    coupon_code: {
        type: String,
    },
    unit_rate: {
        type: Number,
    },
    redemption_start_date: {
        type: String,
    },
    // remarks: {
    //     type: String,
    // },
    // qty: {
    //     type: Number,
    // },
    // createdAt: {
    //     type: Date,
    //     default: new Date(Date.now() + 28800000)
    // },
    updatedAt: {
        type: Date,
        // default: new Date(Date.now() + 28800000)
    }
});

const Gift = db.model('Gift', GiftSchema);
// const Gift = mongoose.model('Gift', GiftSchema);


module.exports = Gift; 
