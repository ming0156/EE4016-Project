const express = require('express');
var AccessControl = require('express-ip-access-control');
var app = express()


//You can see the ip from the request with req.connection.remoteAddress
// app.use((req, res, next) => {
//     let validIps = ['::12', '127.0.0.1']; // Put your IP whitelist in this array
//       if(validIps.includes(req.connection.remoteAddress)){
//           // IP is ok, so go on
//           console.log("IP ok");
//           next();
//         }
//       else{
//           // Invalid ip
//           console.log("Bad IP: " + req.connection.remoteAddress);
//           const err = new Error("Bad IP: " + req.connection.remoteAddress);
//           next(err);
//         }
// })

// var options = {
// 	mode: 'allow',
// 	denys: [],
// 	allows: [],
// 	forceConnectionAddress: false,
// 	log: function(clientIp, access) {
// 		console.log(clientIp + (access ? ' accessed.' : ' denied.'));
// 	},

// 	statusCode: 401,
// 	redirectTo: '',
// 	message: 'Unauthorized'
// };

// var middleware = AccessControl(options);
// app.use(AccessControl(options));

// module.exports = { };

////need to get the whitelist and blacklist first////

const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  if (blacklist.indexOf(ip) >= 0) {
    res.status(403).send('You cannot use this service!');
    return;
  }
  if (whitelist.indexOf(ip) >= 0) {
    next();
    return;
}
}
  
//app.use(rateLimiter);

module.exports= {
  rateLimiter,
};


//// code below are from ssh dev ////
// const fsPromises = require('fs').promises;
// const path = require('path');
// const {getAllIpRecord} = require('../controllers/ipRecordController');

// var whitelist = [{}];
// refreshMachineIps(); // run once when restart the service

// /**
//  * store all active machine's ip to white list
//  * ipRecordController will call this function when add, edit, delete machine ip
//  */
// async function refreshMachineIps(){
//   // default local whitelist ip
//   whitelist = [];
//   const response = await getAllIpRecord(); // get machine ip record
//   if(response.success){
//     for(let i = 0; i < response.data.length; i++){
//       // if the machine is active
//       if(response.data[i].status == 'Active')
//         whitelist.push({ipAddress:response.data[i].ipAddress, activeTime: response.data[i].activeTime})
//     }
//   }
//   console.log(whitelist);
// }

// const ipfilter = (req, res, next) => {
//   const requestIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress
//   //console.log(requestIp)
//   let index = -1;
//   for(let i = 0; i < whitelist.length; i++){
//     // if the white list include ip and current time > active time
//     if(whitelist[i].ipAddress == requestIp){
//       if(new Date(whitelist[i].activeTime).valueOf() < new Date().valueOf()){
//         index = i;
//         break;
//       }
//     }
//   }
//   if (index > -1) {
//     next();
//   }
//   else{
//     const whitelistLogPath = path.join(path.resolve(__dirname, '..'), 'logs', 'Whitelist.json')
//     //console.log(whitelistLogPath)
//     fsPromises.readFile(whitelistLogPath, 'utf8') 
//             .then(data => { 
//                     let json = JSON.parse(data);
//                     json.push({
//                       memberID: '123',
//                       machineID: 'Whitelist-123',
//                       type: 'Invaild IP',
//                       transactionTime: new Date().toISOString(),
//                   });

//                     fsPromises.writeFile(whitelistLogPath, JSON.stringify(json))
//                 })
//         .catch(err => { console.log("Read Error: " +err);});

//     // let whitelistLog = require('./../logs/Whitelist.json');
//     // console.log(whitelistLog)
//     // whitelistLog.push({'a':'a'})
//     res.status(403).send('You cannot use this service!');
//   }
//   return;
// }

// module.exports= {
//   ipfilter,
//   refreshMachineIps,
// };