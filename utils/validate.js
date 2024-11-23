/* eslint-disable no-useless-escape */
const moment = require('moment-timezone');

class Validate {
    // check if password meets SRAA Requirement
    static password(pwd, username) {
        let matched = 0;
        const uppercase = new RegExp('[A-Z]');
        const lowercase = new RegExp('[a-z]');
        const numeric = new RegExp('[0-9]');
        const symbol = new RegExp('[\\W_]');
        const name = new RegExp(username);

        if (pwd.length < 10) return false;
        if (name.test(pwd)) return false;
        if (uppercase.test(pwd)) matched += 1;
        if (lowercase.test(pwd)) matched += 1;
        if (numeric.test(pwd)) matched += 1;
        if (symbol.test(pwd)) matched += 1;
        if (matched >= 4) return true;
        return false;
    }

    // check if it is validate Email Address
    static email(emailAddress) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(emailAddress);
    }

    static notEmpty(data) {
        if (data) return true;
        return false;
    }

    static notEmptyGroup(data) {
        return data.every((item) => item.length !== 0);
    }

    static empty2null(str) {
        str = str || null;
        return str;
    }

    static toDateTime(str) {
        return moment(str.format('YYYY/MM/DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
    }

    static isInt(val) {
        return Number.isInteger(val);
    }

    static isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    static toStringifyJson(str) {
        let jsonStr;
        if (this.isJsonString(str)) {
            jsonStr = str === null ? null : str;
        } else {
            jsonStr = str === null ? null : JSON.stringify(str);
        }
        return jsonStr;
    }

    // check user contains specific permission
    static permissionCheck(req, ...permission) {
        if (req.user && req.user.permissionList.includes(permission)) {
            return true;
        }
        return false;
    }
}

module.exports = Validate;