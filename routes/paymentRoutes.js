const express = require('express');
const router = express.Router();
const MovieModel = require('../models/moviemodel');
const UserModel = require('../models/accountModel');
const VoucherModel = require('../models/voucherModel');
const fs = require('fs');

router.post('/:movieId/payment', async (req, res) => {
  try {
    const { selectedSeats } = req.body;
    const username = req.cookies.username; 

    if (!username) {
        return res.redirect('/Signin');
    }

    const user = await UserModel.findOne({ name: username });

    if (!user) {
        return res.redirect('/Signin');
    }

    const movieData = await MovieModel.findById(req.params.movieId);

    if (!movieData) {
        return res.redirect('/');
    }

    let seatsArray = [];
    if (Array.isArray(selectedSeats)) {
        seatsArray = selectedSeats;
    } else {
        seatsArray.push(selectedSeats);
    }

    const totalPrice = seatsArray.length * movieData.price;

    res.render('payment', {
        id: movieData._id,
        moviePrice: movieData.price,
        selectedTitle: movieData.title,
        selectedSeats: seatsArray,
        selectedDate: movieData.date,
        selectedTime: movieData.time,
        username: username,
        totalPrice: totalPrice
    });

} catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Internal server error" });
}
});


router.post('/:movieId/process_payment', async (req, res) => {
    try {
        const { selectedSeats, totalPrice, voucherCode } = req.body;
        const username = req.cookies.username;

        if (!username) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const user = await UserModel.findOne({ name: username });
        const admin = await UserModel.findOne({ name: "admin" });
        const movieData = await MovieModel.findById(req.params.movieId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const seatsArray = Array.isArray(selectedSeats) ? selectedSeats : [selectedSeats];

        let finalTotalPrice = totalPrice;

        if (voucherCode && voucherCode.trim() !== '') {
            const voucher = await VoucherModel.findOne({ code: voucherCode });
            if (!voucher) {
                return res.status(404).json({ message: "Voucher not found" });
            }
        
            // Apply voucher discount
            if (voucher.discount_type === "percentage") {
                finalTotalPrice -= (totalPrice * voucher.discount_value / 100);
            } else if (voucher.discount_type === "fixed_amount") {
                finalTotalPrice -= voucher.discount_value;
            }
        } else {
            finalTotalPrice = totalPrice;
        }

        if (user.balance < finalTotalPrice) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        user.balance -= finalTotalPrice;

        admin.balance += finalTotalPrice;

        user.balance = parseFloat(user.balance);
        admin.balance = parseFloat(admin.balance);

        seatsArray.forEach(seatIndex => {
            if (movieData.seats[seatIndex]) {
                movieData.seats[seatIndex].booked = true;
            }
        });

        // Update user's tickets
        seatsArray.forEach(seat => {
            user.tickets.push({
                movieTitle: movieData.title,
                seatNumber: seat,
                date: movieData.date,
                time: movieData.time
            });
        });

        await user.save();
        await admin.save();
        await movieData.save();

        res.render('success', {
            sisasaldo: user.balance,
            finalTotalPrice: finalTotalPrice,
        });

    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;