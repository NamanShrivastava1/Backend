const cafeModel = require('../models/cafe.model');
const menuModel = require('../models/menu.model');
const { validationResult } = require('express-validator');
const QRCode = require("qrcode");
const categoryImageMap = require('../utils/categoryImages');
module.exports.cafeInfo = async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({
                errors: error.array(),
                message: "Validation failed"
            });
        }

        const { cafename, address, phoneNo, description } = req.body;

        if (!cafename || !address || !phoneNo) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const cafe = await cafeModel.create({
            cafename,
            address,
            phoneNo,
            description,
            user: req.user._id
        })

        res.status(201).json({
            message: "Cafe information added successfully",
            cafe
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports.showCafeInfo = async (req, res) => {
    try {
        const userId = req.user.id;

        const cafe = await cafeModel.findOne({ user: userId });

        // if (!cafe) {
        //     return res.status(404).json({ message: "Cafe not found" });
        // }

        res.status(200).json({
            message: "Cafe info fetched",
            cafe,
        });
    } catch (error) {
        console.error("Error fetching cafe info:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.addMenuItems = async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({
                errors: error.array(),
                message: "Validation failed"
            });
        }
        const { dishName, price, category, description } = req.body;

        if (!dishName || !price || !category) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const image = (typeof categoryImageMap !== "undefined" && categoryImageMap[category]) || "No Image Available";


        const menu = await menuModel.create({
            dishName,
            price,
            category,
            description,
            image,
            isChefSpecial: req.body.isChefSpecial || false,
            cafe: req.cafe._id
        })

        res.status(201).json({
            message: "Menu item added successfully",
            menu
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports.getMenuItemsByCafe = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const menuItems = await menuModel.find({ cafe: cafeId });

        res.status(200).json({
            menuItems
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports.updateMenuItem = async (req, res) => {
    try {
        const { menuItemId } = req.params;

        if (!menuItemId) {
            return res.status(400).json({
                message: "Menu item ID is required",
            });
        }

        // ✅ Destructure all possible fields from body
        const {
            dishName,
            price,
            category,
            description,
            isChefSpecial,
        } = req.body;

        // ✅ Prepare update object dynamically (excluding undefined)
        const updateFields = {};
        if (dishName !== undefined) updateFields.dishName = dishName;
        if (price !== undefined) updateFields.price = price;
        if (category !== undefined) updateFields.category = category;
        if (description !== undefined) updateFields.description = description;
        if (isChefSpecial !== undefined) updateFields.isChefSpecial = isChefSpecial;

        // ✅ Ensure at least one field is present
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                message: "At least one field is required to update",
            });
        }

        // ✅ Debug log
        console.log("🔧 Updating Menu Item:", menuItemId, updateFields);

        const updateMenu = await menuModel.findByIdAndUpdate(
            menuItemId,
            updateFields,
            { new: true }
        );

        if (!updateMenu) {
            return res.status(404).json({
                message: "Menu item not found",
            });
        }

        res.status(200).json({
            message: "Menu item updated successfully",
            menu: updateMenu,
        });
    } catch (error) {
        console.error("❌ Error in updateMenuItem:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


module.exports.deleteMenuItem = async (req, res) => {
    try {
        const { menuItemId } = req.params;

        if (!menuItemId) {
            return res.status(400).json({
                message: "Menu item ID is required"
            });
        }

        const deletedMenuItem = await menuModel.findByIdAndDelete(menuItemId);

        if (!deletedMenuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            message: "Menu item deleted successfully",
            menu: deletedMenuItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports.generateQRCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const cafe = await cafeModel.findOne({ user: userId });

        if (!cafe) {
            return res.status(404).json({ message: "Cafe not found for user" });
        }

        if (!cafe.qrCode) {
            const qrURL = `https://menuqr.site/api/dashboard/menu/${cafe._id}`;
            const qrImage = await QRCode.toDataURL(qrURL);
            cafe.qrCode = qrImage;
            await cafe.save();
        }

        res.status(200).json({
            message: "QR code ready",
            qrCode: cafe.qrCode,
            cafeId: cafe._id,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate QR",
            error: error.message,
        });
    }
};

module.exports.getMyMenuItems = async (req, res) => {
    try {
        // Get cafeId from authenticated cafe middleware
        const cafeId = req.cafe._id;
        const menuItems = await menuModel.find({ cafe: cafeId });

        res.status(200).json({
            menuItems
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Public cafe routes
module.exports.publicCafeController = async (req, res) => {
    try {
        const cafes = await cafeModel.find();

        // For each cafe, check if it has any Chef Special menu item
        const cafesWithSpecialFlag = await Promise.all(
            cafes.map(async (cafe) => {
                const hasChefSpecial = await menuModel.exists({
                    cafe: cafe._id,
                    isChefSpecial: true,
                });

                return {
                    ...cafe.toObject(),
                    hasChefSpecial: !!hasChefSpecial,
                };
            })
        );

        res.status(200).json({ cafes: cafesWithSpecialFlag });
    } catch (error) {
        console.error("Error fetching public cafes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports.publicMenuController = async (req, res) => {
    try {
        const { cafeId } = req.params;

        const menuItems = await menuModel.find({ cafe: cafeId }).select("dishName description price image category isChefSpecial");

        if (!menuItems || menuItems.length === 0) {
            return res.status(404).json({ message: "No menu items found for this cafe" });
        }

        // Group items by category
        const categoriesMap = {};
        menuItems.forEach((item) => {
            if (!categoriesMap[item.category]) {
                categoriesMap[item.category] = [];
            }
            categoriesMap[item.category].push(item);
        });

        const categories = Object.entries(categoriesMap).map(([category, items]) => ({
            category,
            items,
        }));

        res.status(200).json({ categories });
    } catch (error) {
        console.error("Error fetching public menu:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};