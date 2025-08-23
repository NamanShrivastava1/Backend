const userModel = require('../models/user.model');
const blackListTokenModel = require('../models/blacklistToken.model');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendMail } = require('../utils/email');
const { otpVerificationTemplate } = require('../utils/emailTemplates');

module.exports.registerUser = async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({
                errors: error.array(),
                message: "Validation failed"
            });
        }

        const { fullname, email, mobile, password } = req.body;

        if (!fullname || !email || !mobile || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const isUserExists = await userModel.findOne({ email })
        if (isUserExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const isMobileTaken = await userModel.findOne({ mobile });
        if (isMobileTaken) {
            return res.status(400).json({
                message: "Mobile number is already in use. Please enter a different number.",
            });
        }

        const hashedPassword = await userModel.hashPassword(password);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

        const user = await userModel.create({
            fullname,
            email,
            mobile,
            password: hashedPassword,
            otp: hashedOtp,
            otpExpiry: Date.now() + 5 * 60 * 1000 // 5 mins
        });

        await sendMail(
            email,
            "Verify your ScanDine Account",
            otpVerificationTemplate(fullname, otp)
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email using the OTP sent.",
            user,
            userId: user._id // send userId for OTP verification
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports.loginUser = async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({
                errors: error.array(),
                message: "Validation failed"
            });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        user.jwtVersion += 1;
        await user.save();

        const token = user.generateAuthToken();
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        res.status(200).json({
            message: "Login successful",
            token
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User profile retrieved successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports.getCurrentUser = (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email to access this page" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error getting current user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports.logoutUser = async (req, res) => {
    const token = req.cookies.token || (req.headers.authorization?.split(" ")[1]);

    if (!token) {
        return res.status(400).json({ message: "Token not found" });
    }

    await blackListTokenModel.create({ token });

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "None",
        secure: true
    });

    res.status(200).json({ message: "Logged out successfully" });
};


module.exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await userModel.findOneAndDelete({ _id: userId });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.clearCookie("token");
        res.status(200).json({
            message: "User, associated cafes, and menu items deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({ message: "User ID and OTP are required" });
        }

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({ message: "OTP not generated" });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Hash entered OTP to compare with DB
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

        if (hashedOtp !== user.otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};