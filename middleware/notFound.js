module.exports = (req, res) => {
    response = {
        success: false,
        message: "Not Found"
    };
    return res.status(404).send(response);
};