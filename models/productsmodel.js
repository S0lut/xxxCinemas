const mongoose = require('mongoose');

  const Productschema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
      type: String,
      required: true,
  },
    img: {
        type: String,
        required: true
    },
    size: {
        type: String,
    },
    flavour: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    type: {
      type: String,
      enum: ['food', 'beverage'],
      required: true
    }
},
  {timestamps: true}
);

const product = new mongoose.model("Product", Productschema);
module.exports =  product;