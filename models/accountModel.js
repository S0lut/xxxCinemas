const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
// User Model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  balance:{
    type: Number,
    default :0,
  },
  cart: [
    {
      productId: ObjectId,
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  ordered: [
    {
      name: String,
      quantity: Number,
    }
  ],
  tickets: [
    {
      movieTitle: String,
      seatNumber: Number,
      date: String,
      time: String,
      _id: false
    }
  ]
},
{ timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;