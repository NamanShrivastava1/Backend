const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    dishName: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: [
            "Starters", "Main Course", "Dessert", "Drinks", "Snacks",
            "Breakfast", "Coffee & Tea", "Beverages"
        ],
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    isChefSpecial: {
        type: Boolean,
        default: false,
    },
    image: {
        type: String,
        default: "No Image Available",
    },
    cafe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cafe",
        required: true,
    }
});

const menu = mongoose.model("menu", menuSchema, "menus");
module.exports = menu;