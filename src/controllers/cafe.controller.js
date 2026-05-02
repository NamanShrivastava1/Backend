import cafeModel from "../models/cafe.model.js";
import menuModel from "../models/menu.model.js";
import { validationResult } from "express-validator";
import QRCode from "qrcode";
import categoryImageMap from "../utils/categoryImages.js";
import { sendMail } from "../services/email.service.js";
import { cafeCreatedTemplate } from "../utils/emailTemplates.js";

export const cafeInfo = async (req, res) => {
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

        await sendMail(
            req.user.email,
            "Thank you for registering your cafe with ScanDine",
            cafeCreatedTemplate(req.user.fullname, cafename)
        );

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

export const showCafeInfo = async (req, res) => {
    try {
        const userId = req.user.id;

        const cafe = await cafeModel.findOne({ user: userId });


        res.status(200).json({
            message: "Cafe info fetched",
            cafe,
        });
    } catch (error) {
        console.error("Error fetching cafe info:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addMenuItems = async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({
                errors: error.array(),
                message: "Validation failed",
            });
        }

        const { dishName, halfPrice, fullPrice, category, description } = req.body;

        if (!dishName || !category || (!halfPrice && !fullPrice)) {
            return res.status(400).json({
                message: "Dish name, category, and at least one price (half or full) are required",
            });
        }

        const image =
            (typeof categoryImageMap !== "undefined" &&
                categoryImageMap[category]) ||
            "No Image Available";

        const menu = await menuModel.create({
            dishName,
            halfPrice: halfPrice || undefined,
            fullPrice: fullPrice || undefined,
            category,
            description,
            image,
            isChefSpecial: req.body.isChefSpecial || false,
            cafe: req.cafe._id,
        });



        res.status(201).json({
            message: "Menu item added successfully",
            menu,
        });
    } catch (error) {
        console.error("Error adding menu item:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getMenuItemsByCafe = async (req, res) => {
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

export const updateMenuItem = async (req, res) => {
    try {
        const { menuItemId } = req.params;

        if (!menuItemId) {
            return res.status(400).json({
                message: "Menu item ID is required",
            });
        }

        const {
            dishName,
            halfPrice,
            fullPrice,
            category,
            description,
            isChefSpecial,
        } = req.body;

        const updateFields = {};
        if (dishName !== undefined) updateFields.dishName = dishName;
        if (halfPrice !== undefined) updateFields.halfPrice = halfPrice;
        if (fullPrice !== undefined) updateFields.fullPrice = fullPrice;
        if (category !== undefined) updateFields.category = category;
        if (description !== undefined) updateFields.description = description;
        if (isChefSpecial !== undefined) updateFields.isChefSpecial = isChefSpecial;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                message: "At least one field is required to update",
            });
        }

        const updatedMenu = await menuModel.findByIdAndUpdate(
            menuItemId,
            updateFields,
            { new: true }
        );

        if (!updatedMenu) {
            return res.status(404).json({
                message: "Menu item not found",
            });
        }



        res.status(200).json({
            message: "Menu item updated successfully",
            menu: updatedMenu,
        });
    } catch (error) {
        console.error("❌ Error in updateMenuItem:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


export const deleteMenuItem = async (req, res) => {
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

export const generateQRCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const cafe = await cafeModel.findOne({ user: userId });

        if (!cafe) {
            return res.status(404).json({ message: "Cafe not found for user" });
        }

        if (!cafe.qrCode) {
            const qrURL = `https://scan-dine.vercel.app/menu/${cafe._id}`;
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

export const getMyMenuItems = async (req, res) => {
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
export const publicCafeController = async (req, res) => {
    try {


        // 2️⃣ Fetch from MongoDB
        const cafes = await cafeModel.find();

        // 3️⃣ Add `hasChefSpecial` flag
        const cafesWithSpecialFlag = await Promise.all(
            cafes.map(async (cafe) => {
                const hasChefSpecial = await menuModel.exists({
                    cafe: cafe._id,
                    isChefSpecial: true,
                });

                return {
                    ...cafe.toObject(),
                    hasChefSpecial: Boolean(hasChefSpecial),
                };
            })
        );

        const response = { cafes: cafesWithSpecialFlag };

        return res.status(200).json(response);
    } catch (error) {
        console.error("❌ Error fetching public cafes:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const publicMenuController = async (req, res) => {
    try {
        const { cafeId } = req.params;


        // 2️⃣ Fetch from DB
        const menuItems = await menuModel
            .find({ cafe: cafeId, isAvailable: true })
            .select("dishName description price halfPrice fullPrice image category isChefSpecial");

        if (!menuItems || menuItems.length === 0) {
            const emptyResponse = { categories: [] };
            await redisClient.setEx(cacheKey, 60, JSON.stringify(emptyResponse));
            return res.status(200).json(emptyResponse);
        }

        // 3️⃣ Group items by category
        const categoriesMap = {};
        for (const item of menuItems) {
            if (!categoriesMap[item.category]) {
                categoriesMap[item.category] = [];
            }
            categoriesMap[item.category].push(item);
        }

        const categories = Object.entries(categoriesMap).map(([category, items]) => ({
            category,
            items,
        }));

        const response = { categories };


        return res.status(200).json(response);
    } catch (error) {
        console.error("❌ Error fetching public menu:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await menuModel.findById(id);

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        menuItem.isAvailable = !menuItem.isAvailable;
        await menuItem.save();

        res.status(200).json({
            message: "Availability updated successfully",
            menuItemId: menuItem._id,
            isAvailable: menuItem.isAvailable
        });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
