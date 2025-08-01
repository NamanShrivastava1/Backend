const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const cafeModel = require('../models/cafe.model');

module.exports.authenticateCafe = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }

        const cafe = await cafeModel.findOne({ user: user._id });
        req.user = user;
        if (!cafe) {
            return res.status(403).json({ message: "User does not own a cafe" });
        }
        req.cafe = cafe;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Authentication failed", error: error.message });
    }
}