const Gift = require('../models/gift');
const fetch = require('node-fetch');
const https = require('https');
const bcrypt = require('bcryptjs');
const jwt = require("../utils/jwt");
const randtoken = require('rand-token');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

function health() {

    try {
        return { success: true, message: "stay health" };

    } catch (err) {
        return { success: false, message: "something goes wrong" };
    }

}

async function getAllGifts(param) {
    let page = parseInt(param.page) || 0;
    const rowsPerPage = parseInt(param.rowsPerPage) || 15;
    const isGift = param.isGift;
    const query = param.query;
    const sort = param.sort ? JSON.parse(param.sort) : { _id: -1 };
    const filter = param.filter;

    try {

        // //find all gift
        // gifts = await Gift.find({});

        // if (gifts == null) {
        //     return { success: false, message: 'Invalid username or password' };
        // }

        let queries = [];
        isGift === "true" ? queries.push({ $and: [{ giftId: { $not: { $regex: "C" } } }] }) : queries.push({ $and: [{ giftId: { $regex: "C" } }] });
        if (query) {
            queries.push({
                $or: [
                    { "giftId": { "$regex": query, "$options": "i" } },
                    { "locationId": { "$regex": query, "$options": "i" } },
                ]
            });
        }

        if (filter && filter.length) {
            for (i = 0; i < filter.length; i++) {
                let f = JSON.parse(filter[i]);
                queries.push(f);
            }
        }
        //console.log(JSON.stringify(queries, null, 2))

        const data = await Gift.find({ $and: queries }).sort(sort).limit(rowsPerPage).skip(page * rowsPerPage).collation({ locale: "en_US", numericOrdering: true })
        let totalCount = queries.length ? Gift.countDocuments({ $and: queries }) : Gift.estimatedDocumentCount();
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

// async function findGiftsByDateRange(startDate, endDate) {
//     let gift;
//     try {
//         gift = await Gift.find({
//             createdAt: {
//                 $gte: startDate,
//                 $lt: endDate
//             }
//         }).lean();

//         if (gift && gift.length !== 0) {
//             return {
//                 success: true,
//                 data: gift,
//             }
//         } else {
//             return { success: false, message: 'Cannot find gift' };
//         }
//     } catch (err) {
//         return { success: false, message: err.message };
//     }
// }

// async function checkGiftExists(giftID) {
//     console.log(`checkGiftExists ${giftID}`)
//     await Gift.exists({ giftId: giftID });
// }

async function checkGiftExists(giftId) {
    console.log(giftId)
    try {
        const existingGift = await Gift.findOne({ giftId });
        if (existingGift) {
            // console.log(`Gift ${giftId} exists:`, existingGift);
            // appendError(`Gift ${giftId} already exists in the database`);
            return true;
        }
        else {
            // console.log(`Gift ${giftId} not exists:`, existingGift);
            return false;
        }
    } catch (error) {
        console.error('Error checking gift existence:', error);
        throw error;
    }
}

async function addGifts(session, body) {
    try {
        //console.log(`addGifts: ${JSON.stringify(body, null, 2)}`)
        const giftsWithUpdatedAt = body.map(gift => ({
            ...gift,
            updatedAt: new Date(Date.now() + 28800000)// Set updatedAt to the current time
        }));

        await Gift.insertMany(giftsWithUpdatedAt, { session });
        return {
            success: true,
            data: body
        }
    } catch (err) {
        console.log('error occurred on giftController.addGifts', err);
        return { success: false, err: err };
    }
}

async function findGiftsByCSVFilter(query) {
    let gift;
    const isGift = query.isGift
    let queries = [];
    const filter = query.filter
    console.log(query)
    try {
        isGift === "true" ? queries.push({ $and: [{ giftId: { $not: { $regex: "C" } } }] }) : queries.push({ $and: [{ giftId: { $regex: "C" } }] });
        if (filter && filter.length) {
            for (i = 0; i < filter.length; i++) {
                let f = JSON.parse(filter[i]);
                queries.push(f);
            }
        }
        gift = await Gift.find({ $and: queries }).lean();

        if (gift && gift.length !== 0) {
            return {
                success: true,
                data: gift,
            }
        } else {
            return { success: false, message: 'Cannot find gift' };
        }
    } catch (err) {
        return { success: false, message: err.message };
    }
}

async function addGift(body) {
    try {

        const valid = await Gift.findOne({ giftId: body.giftId });
        if (valid !== null) {
            return {
                success: false,
                data: "Gift ID is used.",
            }
        }

        const gifts = new Gift({ ...body, updatedAt: new Date(Date.now() + 28800000) });
        await gifts.save();
        return {
            success: true,
            data: "Gift added successfully.",
        }
    } catch (err) {
        return { success: false, message: "Fail to add gift." };
    }
}

async function getGiftById(giftId) {
    try {
        const gifts = await Gift.findOne({ giftId: giftId });
        if (gifts === null) {
            return {
                success: false,
                data: "Gift not found.",
            }
        }
        return {
            success: true,
            data: gifts,
        }
    } catch (err) {
        return { success: false, message: "Fail to add gift." };
    }
}


async function updateGiftById(body) {
    try {

        const updatedGift = await Gift.findOneAndUpdate(
            { giftId: body.giftId },
            {
                ...body,
                updatedAt: new Date(Date.now() + 28800000)
            },
            {
                new: true,
                upsert: true,
                useFindAndModify: false,
            }
        );
        return {
            success: true,
            data: updatedGift,
            message: "Update gift information successfully"
        }
    } catch (err) {
        return { success: false, message: "Fail to update gift information" };
    }
}


async function removeGiftById(giftId) {
    try {

        const removeGift = await Gift.findOneAndDelete(
            { giftId: giftId }
        );

        return {
            success: true,
            message: "Remove gift successfully",
        }
    } catch (err) {
        return { success: false, message: "Fail to remove gift", };
    }
}


async function template() {
    try {



        return {
            success: true,
            data: "",
        }
    } catch (err) {
        return { success: false, message: "" };
    }
}


module.exports = {

    health,
    getAllGifts,
    //findGiftsByDateRange,
    checkGiftExists,
    addGifts,
    findGiftsByCSVFilter,
    addGift,
    getGiftById,
    updateGiftById,
    removeGiftById


}