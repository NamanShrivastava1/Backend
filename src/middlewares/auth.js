const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is missing" });
        }

        const isBlacklisted = await blacklistTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }

        if (user.jwtVersion !== decoded.jwtVersion){
            return res.status(401).json({ message: "Session expired. Please login again." })
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Authentication failed", error: error.message });
    }
}
