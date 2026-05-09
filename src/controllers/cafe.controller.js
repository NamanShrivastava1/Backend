import { validationResult } from 'express-validator';
import QRCode from 'qrcode';

import cafeModel from '../models/cafe.model.js';
import menuModel from '../models/menu.model.js';
import { sendMail } from '../services/email.service.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';
import AppError from '../utils/appError.js';
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

export const uploadCafeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    const userId = req.user._id;
    const cafe = await cafeModel.findOne({ user: userId });

    if (!cafe) {
      throw new AppError('Cafe not found for this user', 404);
    }

    // Delete old image if exists
    if (cafe.imageFileId) {
      try {
        await deleteFile(cafe.imageFileId);
      } catch (error) {
        console.warn('Failed to delete old image:', error.message);
      }
    }

    // Upload new image
    const fileName = `cafe-${cafe._id}-${Date.now()}`;
    const uploadedImage = await uploadFile(req.file.buffer, fileName, 'scandine/cafes');

    // Update cafe with new image
    cafe.image = uploadedImage.url;
    cafe.imageFileId = uploadedImage.fileId;
    await cafe.save();

    res.status(200).json({
      message: 'Cafe image uploaded successfully',
      image: uploadedImage.url,
      cafe,
    });
  } catch (error) {
    next(error);
  }
};
