exports.isSuperAdmin = (req) => req.user.role === 'Admin';

//middleware
exports.SuperAdminOnly = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).send({
            success: false,
            message: "Permission Deined"
        });
    } else {
        next();
    }
};