const express = require('express');
const router = express.Router();
const UserModel = require('../models/accountModel');
const VoucherModel = require('../models/voucherModel');



router.post('/update_quantity/:itemId', async (req, res) => {
    try {
        const username = req.cookies.username;
        const itemId = req.params.itemId;
        const newQuantity = req.body.quantity;

        if (!username) {
            return res.redirect('/Signin');
        }

        if (!newQuantity || newQuantity < 1) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        const user = await UserModel.findOne({ name: username });

        if (!user) {
            return res.redirect('/Signin');
        }


        const cartItem = user.cart.find(item => item._id.equals(itemId));

        if (!cartItem) {
            return res.status(404).json({ message: "Item not found in cart" });
        }


        cartItem.quantity = newQuantity;

        await user.save();

        res.redirect('/cart'); 

    } catch (error) {
        console.error("Error updating quantity:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/remove_from_cart/:itemId', async (req, res) => {
    try {
        const username = req.cookies.username;
        const itemId = req.params.itemId;

        if (!username) {
            return res.redirect('/Signin');
        }

        const user = await UserModel.findOne({ name: username });

        if (!user) {
            return res.redirect('/Signin');
        }


        const itemIndex = user.cart.findIndex(item => item._id.equals(itemId));

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }


        user.cart.splice(itemIndex, 1);

        await user.save();

        res.redirect('/cart'); 

    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/clear_cart', async (req, res) => {
    try {
        const username = req.cookies.username;

        if (!username) {
            return res.redirect('/Signin');
        }

        const user = await UserModel.findOne({ name: username });

        if (!user) {
            return res.redirect('/Signin');
        }


        user.cart = [];

        await user.save();

        res.redirect('/cart');

    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/checkout', async (req, res) => {
    try {
        const username = req.cookies.username;

        if (!username) {
            return res.redirect('/Signin');
        }

        const user = await UserModel.findOne({ name: username });
        const admin = await UserModel.findOne({ name: 'admin' });

        if (!user) {
            return res.redirect('/Signin');
        }


        for (const cartItem of user.cart) {
            const existingOrderedItemIndex = user.ordered.findIndex(orderedItem => orderedItem.name === cartItem.name);
            if (existingOrderedItemIndex !== -1) {
                user.ordered[existingOrderedItemIndex].quantity += cartItem.quantity;
            } else {
                user.ordered.push(cartItem);
            }
        }


        user.balance = parseFloat(user.balance);


        user.cart = [];


        const totalPrice = parseFloat(req.body.totalPrice);
        user.totalPrice = parseFloat(user.totalPrice);


        const voucherCode = req.body.voucherCode || '';
        let finalTotalPrice = totalPrice;

        if (voucherCode.trim() !== '') {
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
        }

        // Check if user has sufficient balance
        if (user.balance < finalTotalPrice) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

  
        admin.balance = parseFloat(admin.balance);


        user.balance -= finalTotalPrice;


        admin.balance += finalTotalPrice;

        // Save the changes
        await user.save();
        await admin.save();

        res.render('success', {
            sisasaldo: user.balance,
            finalTotalPrice: finalTotalPrice,
        });

    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;


