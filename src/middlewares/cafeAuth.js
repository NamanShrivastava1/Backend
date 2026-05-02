import jwt from "jsonwebtoken";

import userModel from "../models/user.model.js";
import cafeModel from "../models/cafe.model.js";
import blacklistTokenModel from "../models/blacklistToken.model.js";

export const authenticateCafe = async (req, res, next) => {
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
