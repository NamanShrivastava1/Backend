import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import cafeModel from './cafe.model.js';
import menuModel from './menu.model.js';

const userSchema = new mongoose.Schema(
  {
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
    jwtVersion: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    resetPasswordOtp: {
      type: String,
    },
    resetPasswordOtpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      jwtVersion: this.jwtVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return token;
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

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

const user = mongoose.model('user', userSchema);

export default user;
