import mongoose from 'mongoose';

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
      'Starters',
      'Main Course',
      'Dessert',
      'Drinks',
      'Snacks',
      'Breakfast',
      'Coffee & Tea',
      'Beverages',
    ],
  },
  description: {
    type: String,
    trim: true,
  },
  isChefSpecial: {
    type: Boolean,
    default: false,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      fileId: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
    },
  ],
  halfPrice: {
    type: Number,
  },
  fullPrice: {
    type: Number,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cafe',
    required: true,
  },
});

const menu = mongoose.model('menu', menuSchema, 'menus');
export default menu;
