const expressJwt = require('express-jwt');
const secret = process.env.TOKEN_KEY;

const jwt = expressJwt({ secret, algorithms: ['HS256'] }).unless({
  path: [
    /\/api-docs\/?/,
    /\/api\/hello\/?/,
    /\/api\/staff\/login\/?/,
    /\/api\/staff\/forgetPassword\/?/,
    /\/api\/version\/?/,
  ]
});

function errorHandler(err, req, res, next) {
  if (err.code === 'invalid_token') {
    return res.status(401).send({
      success: false,
      message: "Invalid Token"
    });
  } else if (err.code === 'credentials_required') {
    return res.status(403).send({
      success: false,
      message: "A token is required for authentication"
    });
  }
};

module.exports = {
  jwt,
  errorHandler
};
