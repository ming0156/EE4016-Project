const jsonwebtoken = require('jsonwebtoken');

class jwt {
  static signApiToken() {
    return jsonwebtoken.sign(
      {
        type: "api_token"
      },
      process.env.TOKEN_KEY
    );
  }

  static signStaff(staff, rt) {
    return jsonwebtoken.sign(
      {
        staffId: staff.staffId,
        username: staff.username,
        role: staff.role,
        is_enabled: staff.is_enabled,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: 7200
      }
    );
  }
}

module.exports = jwt;