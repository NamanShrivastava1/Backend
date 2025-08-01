const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cafeModel = require("./cafe.model.js"); 
const menuModel = require("./menu.model.js");

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
})

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    return token;
};

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

userSchema.pre('findOneAndDelete', async function (next) {
    const user = await this.model.findOne(this.getFilter());
    if (!user) return next();

    // Delete all cafes belonging to this user
    const cafes = await cafeModel.find({ user: user._id });

    for (const cafe of cafes) {
        // Delete menu items for each cafe
        await menuModel.deleteMany({ cafe: cafe._id });
    }

    // Delete all cafes after deleting their menus
    await cafeModel.deleteMany({ user: user._id });

    next();
});

const user = mongoose.model("user", userSchema);

module.exports = user;