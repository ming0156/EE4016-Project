const morgan = require('morgan');
const { _DateTime } = require('../utils/time');

morgan.token('statusColor', (req, res, args) => {
    // get the status code if response written
    const status = (typeof res.headersSent !== 'boolean' ? Boolean(res.header) : res.headersSent)
        ? res.statusCode
        : undefined

    // get status color
    const color = status >= 500 ? 31 // red
        : status >= 400 ? 33 // yellow
            : status >= 300 ? 36 // cyan
                : status >= 200 ? 32 // green
                    : 0; // no color

    return '\x1b[' + color + 'm' + status + '\x1b[0m';
});

morgan.token('hktime', () => _DateTime.hk_now('pretty'));

module.exports = morgan(`\x1b[33m:method\x1b[0m \x1b[97m:url\x1b[0m :statusColor \x1b[96m:response-time ms \x1b[94m[len]:res[content-length] \x1b[95m:hktime\x1b[0m`);