const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const MovieModel = require('./models/moviemodel');
const product = require('./models/productsmodel');
const collection = require('./models/accountModel');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const shopRoutes = require('./routes/shopRoutes');
const cartRoutes = require('./routes/cartRoutes');
const cookieParser = require('cookie-parser');


mongoose.connect('mongodb://localhost:27017')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));


const port = 3000;
app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.use(express.json()); 

app.use(express.urlencoded({extended : false}));

app.use('/api/movies', adminRoutes);

app.use(cookieParser());

// Signin route
app.post("/Signin", async (req, res) => {
  try {
      const user = await collection.findOne({ name: req.body.username});
      if (!user) {
          return res.status(404).send("User not found");
      }

      const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isPasswordMatch) {
          return res.status(401).send("Incorrect password");
      }

      // Set the dropdown content to the user's name
      res.cookie("username", user.name); // Set username cookie for client-side access
      res.cookie("balance", user.balance);
      res.cookie("isAdmin", user.isAdmin);

      res.redirect('/');
  } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).send('Internal server error');
  }
});

// Signup route
app.post("/Signup", async (req, res) => {
  try {
      const data = {
          name: req.body.username,
          email: req.body.email,
          password: req.body.password
      };
  
      const existingUser = await collection.findOne({ name: data.name });
      if (existingUser) {
          return res.status(400).send('User already exists. Please choose a different username.');
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
  
      const newUser = new collection({
          name: data.name,
          email: data.email,
          password: hashedPassword
      });
  
      await newUser.save();
      res.redirect('/Signin');
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Internal server error');
  }
});

// Ticket route
app.get('/ticket/:movieId', async (req, res) => {
  const movieId = req.params.movieId;
  try {
      const movieData = await MovieModel.findById(movieId);
      if (!movieData) {
          return res.status(404).send('Movie not found');
      }

      const username = req.cookies.username; // Get username from the cookie
      const isAdmin = req.cookies.isAdmin === 'true';
      if(!username){
        res.redirect('/SignIn')
      }
      else{
        res.render('ticket', { movieData: movieData, username: username, isAdmin: isAdmin });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching the data.');
  }
});

// Routes for other pages
app.get('/', async(req, res) => {
  const movieData = await MovieModel.find();
  if (!movieData) {
      return res.status(404).send('Movie not found');
  }
  
  // Check if the user is an admin based on the isAdmin flag in the cookies
  const isAdmin = req.cookies.isAdmin === 'true';
  console.log(isAdmin)
  // Pass the isAdmin variable to the template
  res.render('home', { movies: movieData, isAdmin: isAdmin });
});

app.get('/Profile', async (req, res) => {
  try {
      const username = req.cookies.username; // Get username from the cookie
      const user = await collection.findOne({ name: username }); // Retrieve user data
      const isAdmin = req.cookies.isAdmin === 'true';
      if (!user) {
          return res.redirect('/SignIn');
      }

      // Pass user data to the EJS template
      res.render('profile', { user: user , isAdmin: isAdmin});
  } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).send('Internal server error');
  }
});

app.post("/updateProfile", async (req, res) => {
  try {
      const { username, email, password } = req.body;

      // Retrieve user from the database
      const user = await collection.findOne({ name: username });

      if (!user) {
          return res.status(404).send("User not found");
      }

      // Update email if provided
      if (email) {
          user.email = email;
      }

      // Update password if provided
      if (password) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          user.password = hashedPassword;
      }

      // Save updated user information
      await user.save();

      res.redirect('/Profile');
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send('Internal server error');
  }
});

app.get('/Signup', (req, res) => {
  res.render('Signup');
});

app.get('/Signin', (req, res) => {
  res.render('Signin');
});

app.use('/ticket',paymentRoutes);
app.use('/Shop', shopRoutes);
app.get('/Shop', async (req, res) => {
  try {
      const username = req.cookies.username; // Get username from the cookie
      const user = await collection.findOne({ name: username }); // Retrieve user data
      const isAdmin = req.cookies.isAdmin === 'true';
      const foodProducts = await product.find({ type: 'food' }); 
      const beverageProducts = await product.find({ type: 'beverage' });
      res.render('Shop', { foodProducts, beverageProducts, user, isAdmin});
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/payment',(req,res,err)=>{
  res.render('Payment')
});

// Admin routes
app.use('/admin', adminRoutes);
app.get('/admin', async (req, res) => {
  const username = req.cookies.username;
  const isAdmin = req.cookies.isAdmin === 'true';
  if (!username){
    return res.redirect('Signin')
  }
  if (!isAdmin){
    return res.redirect('/');
  }
  else{
    return res.redirect('admin');
  }
});

app.use('/cart',cartRoutes);

app.get('/cart', async (req, res) => {
  try {
      const username = req.cookies.username;

      if (!username) {
          return res.redirect('/Signin');
      }

      const products = await product.find();
      const user = await collection.findOne({ name: username }).populate('cart.productId');

      if (!user) {
          return res.redirect('/Signin');
      }

      res.render('cart.ejs', { products, cart: user.cart });
  } catch (error) {
      console.error("Error rendering cart page:", error);
      res.status(500).send("Internal server error");
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});