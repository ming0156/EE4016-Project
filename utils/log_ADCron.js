
const read = require('../utils/read');
const fs = require("fs"); 

exports.logADCron = async (path, remarks, date, success) => {
    let record = await read.readJSONFile(path);
    let item = {"date": date, "success": success, "remarks": remarks, "createdAt": new Date(Date.now() + 28800000)}
    record.push(item)
    let jsonData = JSON.stringify(record)
    fs.writeFileSync( path , jsonData )
}

exports.logAddMemberCreatedAt = async (path, remarks, remarks_fail, final, success) => {
    let record = await read.readJSONFile(path);
    let item = {"success": success, "remarks-success": remarks, "remarks-fail": remarks_fail, "final": final, "createdAt": new Date(Date.now() + 28800000)}
    record.push(item)
    let jsonData = JSON.stringify(record)
    fs.writeFileSync( path , jsonData )
}