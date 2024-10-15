const express=require("express");
const router=express.Router();
const isloggedin=require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

router.get("/",function(req,res){
    let error=req.flash("error");
    res.render("index",{error,loggedin:false});
});

router.get("/shop",isloggedin,async function(req,res){
    let products=await productModel.find();
    let success= req.flash("success")
    res.render("shop",{products,success});
});


// router.get("/addtocart/:productid",isloggedin,async function(req,res){
//     let user=await userModel.findOne({email: req.user.email});
//     user.cart.push(req.params.productid);
//     await user.save();
//     req.flash("success","Added to cart");
//     res.redirect("/shop");
// });
router.get("/addtocart/:productid", isloggedin, async function(req, res) {
  try {
      // Find the user by their email (assuming req.user.email is available from session)
      let user = await userModel.findOne({ email: req.user.email });

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
      res.redirect("/shop");

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
    let user= await userModel.findOne({email:req.user.email});
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
// app.get('/cart', async (req, res) => {
//   const userId = req.session.userId;
//   const user = await User.findById(userId).populate('cart.product');
  
//   res.render('cart', { cartItems: user.cart });
// });



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
          } else if(action=== 'remove'){
              user.cart = user.cart.filter(item => item.product.toString() !== productId);
          }
      }

      await user.save();
      res.json({ success: true });
  } catch (err) {
      res.json({ success: false });
  }
});

module.exports=router;