const fs = require('fs');
const csvSync = require('csv/sync');
const csv = require('csvtojson');

exports.readJSONFile = async(filePath)=>{
    // console.log(`readJSONFile ${filePath}`)
    // console.log('__dirname: ' , __dirname) //test
    rawData =  fs.readFileSync(filePath);
    if(rawData == ''){
        console.log(`${filePath} is empty, return {}`)
        return {}
    }else{
        parsedData = JSON.parse(rawData);
        return parsedData
    }
}

exports.checkPathExist = async(path) => {
    if(fs.existsSync(path)){
        console.log(`${path} exists, continue`)
        return true
    }else{
        console.log(`${path} does not exist`)
        return false
    }
}

exports.toCSV = (obj, exportFilename)=>{
    const csvArray = Object.keys(obj).map((key) => [`'${obj[key].memberID.toString()}`, obj[key].count]); // {memberID:count} to [memberID, count]
    // console.log(csvArray)
    const output = csvSync.stringify(csvArray, {
        columns: [
            "memberID",
            "count"
        ],
        header: true,
        bom: true,
        cast: { date: v => v.toISOString(), }
    });
    fs.writeFileSync(`./csv/${exportFilename}.csv`, output);
    console.log(`toCSV done, export to ./csv/${exportFilename}.csv`);
}

exports.toJSON = async (fromFilePath, exportFilename) => {
    csv()
        .fromFile(fromFilePath)
        .then((jsonObj) => {
            const jsonString = JSON.stringify(jsonObj);
            fs.writeFileSync(`./json/${exportFilename}.json`, jsonString, (err) => {
                if (err) {
                    throw err;
                }else{
                    console.log(`${fromFilePath} converted to ${exportFilename}.json successfully!`);
                    return jsonString;
                }
                // process.exit()
            });
            
        });
}