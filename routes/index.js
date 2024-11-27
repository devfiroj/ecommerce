const express=require("express");
const router=express.Router();
const isloggedin=require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const orderModel=require("../models/order-model");


router.get("/",function(req,res){
    const { otp='',fullname = '', email = '' } = req.query;
    let error=req.flash("error");
    res.render("index",{error,loggedin:false,otp,fullname,email});
});

router.get("/shop", isloggedin, async function (req, res) {
    const { sortby } = req.query; // Get the sorting option from the query

    let products;
    
    try {
        // Sorting logic
        if (sortby === 'newest') {
            products = await productModel.find().sort({ _id: -1 }); // Sort by newest (by creation time)
        } else if (sortby === 'lowtohigh') {
            products = await productModel.find().sort({ price: 1 }); // Sort by price low to high
        } else if (sortby === 'hightolow') {
            products = await productModel.find().sort({ price: -1 }); // Sort by price high to low
        } else {
            // Default sorting, assuming popular is default
            products = await productModel.find(); // You can replace this with custom sorting logic if needed
        }

        let success = req.flash("success");
        res.render("shop", { products, success, sortby });
    } catch (error) {
        console.error("Error fetching products: ", error);
        res.status(500).send("Error fetching products");
    }
});



// router.get("/addtocart/:productid",isloggedin,async function(req,res){
//     let user=await userModel.findOne({email: req.user.email});
//     user.cart.push(req.params.productid);
//     await user.save();
//     req.flash("success","Added to cart");
//     res.redirect("/shop");
// });
router.get("/addtocart/:productid",isloggedin, async function(req, res) {
  try {
      // Find the user by their email (assuming req.user.email is available from session)
      let user = await userModel.findOne({ email: req.user.email });
      const { sortby } = req.query; 
      //console.log(sortby);
      if (!user) {
          req.flash("error", "User not found");
          return res.redirect("/login");
      }

      // Check if the product is already in the cart
      const cartItemIndex = user.cart.findIndex(item => item.product.toString() === req.params.productid);

      if (cartItemIndex > -1) {
          // Product already exists in cart, so increment the quantity
          user.cart[cartItemIndex].quantity += 1;
      } else {
          // Add new product to the cart with quantity 1
          user.cart.push({
              product: req.params.productid,
              quantity: 1 // Default quantity is 1
          });
      }

      // Save the updated user document
      await user.save();

      req.flash("success", "Product added to cart");
      if (sortby) {
        res.redirect(`/shop?sortby=${sortby}`);
        } else {
        res.redirect("/shop");
        }

  } catch (err) {
      console.error(err);
      req.flash("error", "An error occurred while adding to the cart");
      res.redirect("/shop");
  }
});

router.get("/logout",isloggedin,async function(req,res){
    let products=await productModel.find();
    res.render("shop",{products});
});
router.get("/account",isloggedin,async function(req,res){
    let user= await userModel.findOne({email:req.user.email}).populate('orders');
    res.render("profile",{user});
    
})

router.post('/updateprofile',isloggedin,async(req, res) => {

    function findByEmailAndUpdate(email, updateData) {
    userModel.findOneAndUpdate(
      { email: email },        // Search condition (find user by email)
      updateData,              // Update data
      { new: true }            // Options: return the updated document
    )
    .then(updatedUser => {
      if (updatedUser) {
        res.json({ message: 'Profile updated successfully!', updatedUser});
        
      } else {
        console.log('User not found');
      }
    })
    .catch(err => {
      console.error('Error updating user:', err);
    });
  }
  findByEmailAndUpdate(req.body.email, { fullname: req.body.fullname, contact:req.body.contact, address:req.body.address});
});
router.get("/cart", isloggedin, async (req, res) => {
  let user=await userModel.findOne({email:req.user.email}).populate('cart.product');
  //console.log(user.cart);
  res.render('cart4', { cartItems: user.cart });
});




router.post('/cart/update',isloggedin, async (req, res) => {
  const { productId, action } = req.body;
  //const userId = req.session.userId; // Assuming you have user session management

  try {
      const user = await userModel.findOne({email:req.user.email});

      const cartItem = user.cart.find(item => item.product.toString() === productId);
      if (cartItem) {
          if (action === 'increase') {
              cartItem.quantity += 1;
          } else if (action === 'decrease' && cartItem.quantity > 1) {
              cartItem.quantity -= 1;
          }  else if (action === 'decrease' && cartItem.quantity == 1) {
            user.cart = user.cart.filter(item => item.product.toString() !== productId);
          } 
          else if(action=== 'remove'){
              user.cart = user.cart.filter(item => item.product.toString() !== productId);
          }
      }

      await user.save();
      res.json({ success: true });
  } catch (err) {
      res.json({ success: false });
  }
});


//checkout route
router.get('/checkout', isloggedin, async (req, res) => {
    try {
        // Fetch the logged-in user and populate the cart
        const user = await userModel.findOne({ email: req.user.email }).populate('cart.product');

        // Calculate total price
        let totalAmount = 0;
        user.cart.forEach(item => {
            totalAmount += item.quantity * item.product.price;
        });

        res.render('checkout', {
            user: user,
            cartItems: user.cart,
            totalAmount: totalAmount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// place order
router.post('/place-order', isloggedin, async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;
    const user = await userModel.findOne({ email: req.user.email }).populate('cart.product');

    if (!user || user.cart.length === 0) {
        req.flash('error', 'Your cart is empty');
        res.redirect('/cart');
    }
    else{
    // Calculate total amount
    let totalAmount = 0;
    user.cart.forEach(item => {
        totalAmount += item.product.price * item.quantity;
    });

    // Create the order
    const newOrder = new orderModel({
        user: user._id,
        products: user.cart.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            priceAtPurchase: item.product.price
        })),
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        paymentStatus: 'pending' // Update based on payment later
    });

    await newOrder.save();

    // Clear the cart
    user.cart = [];
    user.orders.push(newOrder);
    await user.save();

    req.flash('success', 'Order placed successfully');
    res.redirect('/shop');
  }
});



// GET /orders - Display the user's orders
router.get('/myorders', isloggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email }).populate({
            path: 'orders',
            populate: {
                path: 'products.product', // Populating the product details
                model: 'product'
            }
        });

        res.render('myorders', { user });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.post('/orders/cancel/:orderId', isloggedin, async (req, res) => {
  try {
      const order = await orderModel.findById(req.params.orderId);
      if (order && order.orderStatus === 'processing') {
          order.orderStatus = 'canceled';
          await order.save();
          req.flash('success', 'Order canceled successfully');
      } else {
          req.flash('error', 'Order cannot be canceled');
      }
      res.redirect('/myorders');
  } catch (err) {
      req.flash('error', 'Something went wrong');
      res.redirect('/myorders');
  }
});



module.exports=router;