import mongoose from 'mongoose';

import menuModel from './menu.model.js';

const cafeSchema = new mongoose.Schema({
  cafename: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  qrCode: {
    type: String, // because it's a base64 image
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  imageFileId: {
    type: String,
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

cafeSchema.pre('findOneAndDelete', async function (next) {
  const cafe = await this.model.findOne(this.getFilter());
  if (!cafe) return next();

  await menuModel.deleteMany({ cafe: cafe._id });

  next();
});

const cafe = mongoose.model('cafe', cafeSchema, 'cafes');
export default cafe;
