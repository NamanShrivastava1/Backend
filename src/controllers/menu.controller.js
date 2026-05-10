import { validationResult } from 'express-validator';

import menuModel from '../models/menu.model.js';
import { deleteFile, uploadMultipleFiles } from '../services/storage.service.js';
import AppError from '../utils/appError.js';
import categoryImageMap from '../utils/categoryImages.js';

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

export const toggleMenuItemAvailability = async (req, res, next) => {
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

export const uploadMenuItemImages = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    if (!menuItemId) {
      throw new AppError('Menu item ID is required', 400);
    }

    if (!req.files || req.files.length === 0) {
      throw new AppError('No image files provided', 400);
    }

    if (req.files.length > 5) {
      throw new AppError('Maximum 5 images allowed per menu item', 400);
    }

    const menuItem = await menuModel.findById(menuItemId);

    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    // Delete old images if they exist
    if (menuItem.images && Array.isArray(menuItem.images)) {
      try {
        await Promise.all(
          menuItem.images.map((img) => {
            if (img.fileId) {
              return deleteFile(img.fileId);
            }
          })
        );
      } catch (error) {
        console.warn('Failed to delete old images:', error.message);
      }
    }

    // Upload new images
    const fileNames = req.files.map((file, index) => `menu-${menuItemId}-${index}-${Date.now()}`);
    const uploadedImages = await uploadMultipleFiles(req.files, fileNames, 'scandine/menu');

    // Update menu item with new images
    menuItem.images = uploadedImages.map((img) => ({
      url: img.url,
      fileId: img.fileId,
      fileName: img.fileName,
    }));

    await menuItem.save();

    res.status(200).json({
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: menuItem.images,
      menuItem,
    });
  } catch (error) {
    next(error);
  }
};
