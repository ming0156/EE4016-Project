class Helper {
    static unknownError(res) {
        res.status(500).json({ success: false, message: "Unknown Error" });
    }

    static roundTo (number, decimal) {
        const d = Math.pow(10, decimal);
        return Math.round(number * d) / d;
    }
}

module.exports = Helper;