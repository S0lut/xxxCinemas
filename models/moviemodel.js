const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: Number,
  booked: { type: Boolean, default: false },
  _id: false
});

// Movie Model
const movieSchema = new mongoose.Schema({
  title: String,
  posterUrl: String,
  genre: String,
  ageRating: String,
  runtime  : Number,
  director: String,
  seats: [seatSchema],
  date: {type: Date, get: getDateWithoutTimezone },
  time: String,
  price: Number
});

function getDateWithoutTimezone(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}-${month}`;
}

const MovieModel = mongoose.model('Movie', movieSchema);

module.exports = MovieModel;
