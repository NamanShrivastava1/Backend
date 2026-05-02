import { validationResult } from 'express-validator';
import QRCode from 'qrcode';

import cafeModel from '../models/cafe.model.js';
import menuModel from '../models/menu.model.js';
import { sendMail } from '../services/email.service.js';
import AppError from '../utils/appError.js';
import categoryImageMap from '../utils/categoryImages.js';
import { cafeCreatedTemplate } from '../utils/emailTemplates.js';

export const createCafe = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      throw new AppError(error.array()[0].msg || 'Validation failed', 400);
    }

    const { cafename, address, phoneNo, description } = req.body;

    if (!cafename || !address || !phoneNo) {
      throw new AppError('Cafe name, address, and phone number are required', 400);
    }

    const cafe = await cafeModel.create({
      cafename,
      address,
      phoneNo,
      description,
      user: req.user._id,
    });

    await sendMail(
      req.user.email,
      'Thank you for registering your cafe with ScanDine',
      cafeCreatedTemplate(req.user.fullname, cafename)
    );

    res.status(201).json({
      message: 'Cafe information added successfully',
      cafe,
    });
  } catch (error) {
    next(error);
  }
};

export const showCafeInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cafe = await cafeModel.findOne({ user: userId });
    if (!cafe) {
      throw new AppError('No cafe found for this user', 404);
    }

    res.status(200).json({
      message: 'Cafe info fetched',
      cafe,
    });
  } catch (error) {
    next(error);
  }
};

export const addMenuItems = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      throw new AppError(error.array()[0].msg || 'Validation failed', 400);
    }

    const { dishName, halfPrice, fullPrice, category, description } = req.body;

    if (!dishName || !category || (!halfPrice && !fullPrice)) {
      throw new AppError(
        'Dish name, category, and at least one price (half or full) are required',
        400
      );
    }

    const image =
      (typeof categoryImageMap !== 'undefined' && categoryImageMap[category]) ||
      'No Image Available';

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
      message: 'Menu item added successfully',
      menu,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemsByCafe = async (req, res, next) => {
  try {
    const { cafeId } = req.params;

    if (!cafeId) {
      throw new AppError('Cafe ID is required', 400);
    }

    const menuItems = await menuModel.find({ cafe: cafeId });

    res.status(200).json({
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    if (!menuItemId) {
      throw new AppError('Menu item ID is required', 400);
    }

    const { dishName, halfPrice, fullPrice, category, description, isChefSpecial } = req.body;

    const updateFields = {};
    if (dishName !== undefined) updateFields.dishName = dishName;
    if (halfPrice !== undefined) updateFields.halfPrice = halfPrice;
    if (fullPrice !== undefined) updateFields.fullPrice = fullPrice;
    if (category !== undefined) updateFields.category = category;
    if (description !== undefined) updateFields.description = description;
    if (isChefSpecial !== undefined) updateFields.isChefSpecial = isChefSpecial;

    if (Object.keys(updateFields).length === 0) {
      throw new AppError('At least one field is required to update', 400);
    }

    const updatedMenu = await menuModel.findByIdAndUpdate(menuItemId, updateFields, { new: true });

    if (!updatedMenu) {
      throw new AppError('Menu item not found', 404);
    }

    res.status(200).json({
      message: 'Menu item updated successfully',
      menu: updatedMenu,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    if (!menuItemId) {
      throw new AppError('Menu item ID is required', 400);
    }

    const deletedMenuItem = await menuModel.findByIdAndDelete(menuItemId);

    if (!deletedMenuItem) {
      throw new AppError('Menu item not found', 404);
    }

    res.status(200).json({
      message: 'Menu item deleted successfully',
      menu: deletedMenuItem,
    });
  } catch (error) {
    next(error);
  }
};

export const generateQRCode = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cafe = await cafeModel.findOne({ user: userId });

    if (!cafe) {
      throw new AppError('Cafe not found for this user', 404);
    }

    if (!cafe.qrCode) {
      const qrURL = `https://scan-dine.vercel.app/menu/${cafe._id}`;
      const qrImage = await QRCode.toDataURL(qrURL);
      cafe.qrCode = qrImage;
      await cafe.save();
    }

    res.status(200).json({
      message: 'QR code ready',
      qrCode: cafe.qrCode,
      cafeId: cafe._id,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyMenuItems = async (req, res, next) => {
  try {
    // Get cafeId from authenticated cafe middleware
    const cafeId = req.cafe._id;
    const menuItems = await menuModel.find({ cafe: cafeId });

    res.status(200).json({
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// Public cafe routes
export const publicCafeController = async (req, res, next) => {
  try {
    // Fetch from MongoDB
    const cafes = await cafeModel.find();

    // Add `hasChefSpecial` flag
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
    next(error);
  }
};

export const publicMenuController = async (req, res, next) => {
  try {
    const { cafeId } = req.params;

    if (!cafeId) {
      throw new AppError('Cafe ID is required', 400);
    }

    // Fetch from DB
    const menuItems = await menuModel
      .find({ cafe: cafeId, isAvailable: true })
      .select('dishName description price halfPrice fullPrice image category isChefSpecial');

    if (!menuItems || menuItems.length === 0) {
      const emptyResponse = { categories: [] };
      return res.status(200).json(emptyResponse);
    }

    // Group items by category
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
    next(error);
  }
};

export const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Menu item ID is required', 400);
    }

    const menuItem = await menuModel.findById(id);

    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.status(200).json({
      message: 'Availability updated successfully',
      menuItemId: menuItem._id,
      isAvailable: menuItem.isAvailable,
    });
  } catch (error) {
    next(error);
  }
};
