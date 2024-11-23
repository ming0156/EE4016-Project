const { Temporal, toTemporalInstant } = require('@js-temporal/polyfill');
Date.prototype.toTemporalInstant = toTemporalInstant;

const tz_hk = Temporal.TimeZone.from('Asia/Hong_Kong');

class _Date {

}

class _Time {

}

class _DateTime {
    static hk_now(returnType) {
        const instant = Temporal.Now.plainDateTimeISO(tz_hk);

        switch (returnType) {
            case 'pretty':
                return `${instant.round({ smallestUnit: 'second' }).toString().replace('T', ' ')} [+08:00]`;
            case 'iso':
                return `${instant.toString()}+08:00`;
            default:
                return new Date(`${instant.toString()}+08:00`);
        }
    }
}

module.exports = {
    _Date,
    _Time,
    _DateTime
};