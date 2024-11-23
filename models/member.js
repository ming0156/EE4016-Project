const mongoose = require("mongoose");
const db = mongoose.connection.useDb("epis");
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  memberID: {
    type: String,
  },
  username: {
    type: String,
  },
  transferedFromID: {
    type: Array,
  },
  membership: {
    type: Boolean, //true for valid member
  },
  memberType: {
    type: Number,
  },
  physicalCard: {
    type: Boolean,
  },
  balance: {
    type: Number,
  },
  bonus: {
    type: Number,
  },
  redemptionTotal: {
    type: Number,
  },
  address: {
    type: String,
  },
  district: {
    type: String,
  },
  gender: {
    type: String,
  },
  bday: {
    type: String,
  },
  tel: {
    type: Number,
  },
  email: {
    type: String,
  },
  buildingType: {
    type: String,
  },
  occupation: {
    type: String,
  },
  remarks: {
    type: String,
  },
  updateAt: {
    type: Date,
  },
  qtyBAT: {
    type: Number,
  },
  qtyBook: {
    type: Number,
  },
  qtyCloth: {
    type: Number,
  },
  qtyFLT: {
    type: Number,
  },
  qtyFoodWaste: {
    type: Number,
  },
  qtyGlassBottle: {
    type: Number,
  },
  qtyMetal1: {
    type: Number,
  },
  qtyMetal2: {
    type: Number,
  },
  qtyPlastic1: {
    type: Number,
  },
  qtyPlastic2: {
    type: Number,
  },
  qtyREE: {
    type: Number,
  },
  qtySEA: {
    type: Number,
  },
  qtyToner: {
    type: Number,
  },
  qtyTP: {
    type: Number,
  },
  qtyWP1: {
    type: Number,
  },
  qtyWP2: {
    type: Number,
  },
  qtyWP3: {
    type: Number,
  },
  qtyMISC1: {
    type: Number,
  },
  qtyMISC2: {
    type: Number,
  },
  qtyMISC3: {
    type: Number,
  },
  qtyMISC4: {
    type: Number,
  },
  qtyMISC5: {
    type: Number,
  },
  qtyMISC6: {
    type: Number,
  },
  qtyMISC7: {
    type: Number,
  },
  qtyMISC8: {
    type: Number,
  },
  spare1: {
    type: Number,
  },
  spare2: {
    type: Number,
  },
  spare3: {
    type: Number,
  },
  spare4: {
    type: Number,
  },
  spare5: {
    type: Number,
  },
  createAt: {
    type: Date,
  },
}, { timestamps: false });

const Member = db.model('Member', memberSchema);
//const Member = mongoose.model('Member', memberSchema);


module.exports = Member;
