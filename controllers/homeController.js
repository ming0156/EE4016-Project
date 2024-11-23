// const axios = require('axios');
// const episBase = `http://${process.env.EPIS_NAME}:${process.env.EPIS_HOST}`;
const Member = require('../models/member');
const { roundTo } = require('../utils/helper');

exports.getCount = async () => {
    try {
        const count = await Member.countDocuments({}, { hint: "_id" });
        return {
            success: true,
            data: count,
        };
    } catch (err) {
        return { success: false, message: "Error occuried" };
    }
}

exports.getAllMembers = async (param) => {
    let page = parseInt(param.page) || 0;
    const rowsPerPage = parseInt(param.rowsPerPage) || 500000;
  
    try {
      const data = await Member.find({}, { transactions: 0, _id: 0 }).limit(rowsPerPage).skip(page * rowsPerPage);
      let totalCount = queries.length ? Member.countDocuments({}, { hint: "_id" }) : Member.estimatedDocumentCount();
      totalCount = await totalCount;
      const totalPage = Math.ceil(totalCount / rowsPerPage);
      if (page > totalPage) page = totalPage;
  
      return {
        success: true,
        data,
        page,
        rowsPerPage,
        totalCount,
        totalPage,
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
}

exports.checkMemberExists = async (memberID) => await Member.exists({ memberID });

exports.addTransactions = async (session, transactions) => {
    try {
        const type_to_qty = (type) => (
            {
                bat: "qtyBAT",
                book: "qtyBook",
                cloth: "qtyCloth",
                flt: "qtyFLT",
                foodwaste: "qtyFoodWaste",
                glassbottle: "qtyGlassBottle",
                metal1: "qtyMetal1",
                metal2: "qtyMetal2",
                plastic1: "qtyPlastic1",
                plastic2: "qtyPlastic2",
                ree: "qtyREE",
                sea: "qtySEA",
                toner: "qtyToner",
                tp: "qtyTP",
                wp1: "qtyWP1",
                wp2: "qtyWP2",
                wp3: "qtyWP3",
                misc1: "qtyMISC1",
                misc2: "qtyMISC2",
                misc3: "qtyMISC3",
                misc4: "qtyMISC4",
                misc5: "qtyMISC5",
                misc6: "qtyMISC6",
                misc7: "qtyMISC7",
                misc8: "qtyMISC8"
            }[type.toLowerCase()]
        );

        for (const el of transactions) {
            const member = await Member.findOne({ memberID: el.memberID }).session(session);
            if (member) {
                if (el.status === 'valid') {
                    const qtyName = type_to_qty(el.type);
                    member[qtyName] = roundTo((member[qtyName] !== undefined ? member[qtyName] : 0) + el.weight, 10);
                    member['balance'] = roundTo((member['balance'] !== undefined ? member['balance'] : 0) + el.greenScore, 10);
                }

                member['transactions'].push(el);
                member['transactions'] = member['transactions'].splice(-30);
                member['updateAt'] = new Date(Date.now() + 28800000);

                await member.save();
            }
        };
        return { success: true, message: "Members updated" };
    } catch (err) {
        console.log('error occurred on memberController.addTransactions', err);
        return { success: false, err };
    }
}