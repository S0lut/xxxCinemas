const express = require('express');
const router = express.Router();
const ProductModel = require('../models/productsmodel');
const UserModel = require('../models/accountModel');
const VoucherModel = require('../models/voucherModel');
const fs = require('fs');

router.post('/:productId/add_to_cart', async (req, res) => {
    try {
        const username = req.cookies.username;

        if (!username) {
            return res.redirect('/Signin');
        }

        const user = await UserModel.findOne({ name: username });
        const product = await ProductModel.findById(req.params.productId);

        if (!user) {
            return res.redirect('/Signin');
        }

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const existingCartItemIndex = user.cart.findIndex(item => item._id.equals(product._id));
        if (existingCartItemIndex !== -1) {
            // If the product is already in the cart, increase its quantity by 1
            user.cart[existingCartItemIndex].quantity += 1;
        } else {
            // If the product is not in the cart, add it with quantity 1
            user.cart.push({
                _id: product._id,
                name: product.title,
                quantity: 1,
                price: product.price
            });
        }

        await user.save();

        res.redirect('/Shop');

    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;