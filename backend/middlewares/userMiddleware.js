class userMiddleware {
    static addRoleField = (req, res, next) => {
        if (!req.body.hasOwnProperty("role")) {
            req.body["role"] = "customer";
        }
        next();
    };
}

module.exports = userMiddleware;
