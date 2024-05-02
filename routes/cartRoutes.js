const express = require('express');
const router = express.Router();
const UserModel = require('../models/accountModel'); // Assuming this is the path to your UserModel
const VoucherModel = require('../models/voucherModel');


// Route handler to update the quantity of an item in the cart
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

        // Find the item in the user's cart
        const cartItem = user.cart.find(item => item._id.equals(itemId));

        if (!cartItem) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Update the quantity
        cartItem.quantity = newQuantity;

        await user.save();

        res.redirect('/cart'); // Redirect to cart page after updating the quantity

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

        // Find the index of the item in the user's cart
        const itemIndex = user.cart.findIndex(item => item._id.equals(itemId));

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Remove the item from the cart
        user.cart.splice(itemIndex, 1);

        await user.save();

        res.redirect('/cart'); // Redirect to cart page after removing the item

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

        // Clear all items from the cart
        user.cart = [];

        await user.save();

        res.redirect('/cart'); // Redirect to cart page after clearing the cart

    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route handler for checkout
router.post('/checkout', async (req, res) => {
    try {
        const username = req.cookies.username;

        if (!username) {
            return res.redirect('/Signin');
        }

        const user = await UserModel.findOne({ name: username });

        if (!user) {
            return res.redirect('/Signin');
        }

        // Move items from cart to ordered
        for (const cartItem of user.cart) {
            const existingOrderedItemIndex = user.ordered.findIndex(orderedItem => orderedItem.name === cartItem.name);
            if (existingOrderedItemIndex !== -1) {
                // If the same item already exists in ordered, increase its quantity
                user.ordered[existingOrderedItemIndex].quantity += cartItem.quantity;
            } else {
                // Otherwise, add it as a new item in ordered
                user.ordered.push(cartItem);
            }
        }

        // Clear the cart
        user.cart = [];

        // Calculate the total price of items in ordered
        const totalPrice = req.body.totalPrice;

        // Check if voucher code is provided and not empty
        const voucherCode = req.body.voucherCode || ''; // Assuming voucherCode is passed as a form field
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

        // Reduce user's balance
        user.balance -= finalTotalPrice;

        // Save the changes
        await user.save();

        res.render('success', {
            finalTotalPrice: user.balance,
        });

    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
