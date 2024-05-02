  const express = require('express');
  const router = express.Router();
  const MovieModel = require('../models/moviemodel');
  const ProductModel = require('../models/productsmodel')
  const UserModel = require('../models/accountModel');
  const voucherModel = require('../models/voucherModel');
  const fs = require('fs');

  // Display admin page
  router.get('/', async (req, res) => {
    try {
        const movies = await MovieModel.find();
        const products = await ProductModel.find();
        const users = await UserModel.find();
        const voucher = await voucherModel.find();
        res.render('admin', { movies, products, users, voucher });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/create', async (req, res) => {
    const { title, posterUrl, genre, ageRating, runtime, director, price, numSeats, date, time } = req.body;
  
    try {
      // Check if the movie with the same title already exists
      const existingMovie = await MovieModel.findOne({ title });
  
      if (existingMovie) {
        return res.status(400).json({ error: 'Movie with the same title already exists.' });
      }
  
      // Generate seat array
      const seats = [];
      for (let i = 1; i <= parseInt(numSeats); i++) {
        seats.push({ number: i, booked: false });
      }
  
      const movie = new MovieModel({
        title,
        posterUrl,
        genre,
        ageRating,
        runtime,
        director,
        price,
        seats,
        date,
        time,
      });
  
      await movie.save();
      res.redirect('/admin');
    } catch (error) {
      console.error('Error creating movie:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });


  // Delete a movie
  router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await MovieModel.findByIdAndDelete(id);
    res.redirect('/admin');
  });

  // PUT route to update a movie
  router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, posterUrl, genre, ageRating, runtime, director, price, numSeats, date, time } = req.body;

    // Generate seat array
    const seats = [];
    for (let i = 1; i <= parseInt(numSeats); i++) {
        seats.push({ number: i, booked: false });
    }
    try {
        const movie = await MovieModel.findByIdAndUpdate(id, {
            title,
            posterUrl,
            genre,
            ageRating,
            runtime,
            director,
            price,
            seats,
            date,
            time,
        }, { new: true });

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


  router.post('/add-product', async (req, res) => {
    try {
        const { title, desc, img, price, type } = req.body;
  
        // Periksa apakah produk dengan judul yang sama sudah ada dalam database
        const existingProduct = await ProductModel.findOne({ title });
        if (existingProduct) {
            return res.status(400).send('Product with the same title already exists');
        }
  
        const newProduct = new ProductModel({ title, desc, img, price, type });
        await newProduct.save();
        res.redirect('/'); // Redirect back to admin page after adding product
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Internal Server Error');
    }
  });

  router.delete('/delete-product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        await ProductModel.findByIdAndDelete(productId);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal Server Error');
    }
  });
  
  // Menambahkan fitur untuk memperbarui produk
  router.post('/update-product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { title, desc, img, price, type } = req.body;
  
        const updatedProduct = await ProductModel.findByIdAndUpdate(productId, { title, desc, img, price, type }, { new: true });
        res.redirect('/admin')
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Internal Server Error');
    }
  });

  router.get('/users/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  });

  router.post('/user-delete/:id', async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.redirect('/admin')
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  });

  router.post('/user-edit/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { name, email, balance, type } = req.body;

    try {
        // Find the user by ID
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user data
        user.name = name;
        user.email = email;
        user.balance = balance;
        user.isAdmin = (type === 'true'); // Convert string 'true' or 'false' to boolean

        // Save the updated user
        await user.save();

        res.redirect('/admin')
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/create-voucher', async (req, res) => {
  try {
      const voucher = await voucherModel.create(req.body);
      res.redirect('/admin')
  } catch (error) {
      console.error('Error creating voucher:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/edit-voucher/:id', async (req, res) => {
  try {
      const voucher = await voucherModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!voucher) {
          return res.status(404).json({ message: 'Voucher not found' });
      }
      res.redirect('/admin');
  } catch (error) {
      console.error('Error updating voucher:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/delete-voucher/:id', async (req, res) => {
  try {
      const voucher = await voucherModel.findByIdAndDelete(req.params.id);
      if (!voucher) {
          return res.status(404).json({ message: 'Voucher not found' });
      }
      res.redirect('/admin');
  } catch (error) {
      console.error('Error deleting voucher:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
