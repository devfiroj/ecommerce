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
router.get("/cart", isloggedin, async function (req, res) {
    try {
        // Find the user and populate the cart with product details
        let user = await userModel.findOne({ email: req.user.email }).populate('cart.product');

        // Initialize subtotal
        let subtotal = 0;
        
        // Calculate subtotal based on product price and quantity
        user.cart.forEach(product => {
            if (product.product) { // Ensure the product is populated
                subtotal += product.product.price * product.quantity;
            }
        });

        // Calculate tax, shipping, and total
        const taxRate = 0.05; // 5% tax
        const shippingRate = 15.00; // Flat shipping rate
        const tax = subtotal * taxRate;
        const shipping = subtotal > 0 ? shippingRate : 0;
        const total = subtotal + tax + shipping;

        // Render the cart page, passing the user and calculated values
        res.render("cart3", { user, subtotal, tax, shipping, total });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving cart data");
    }
});

router.get("/addtocart/:productid",isloggedin,async function(req,res){
    let user=await userModel.findOne({email: req.user.email});
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success","Added to cart");
    res.redirect("/shop");


});
router.get("/logout",isloggedin,async function(req,res){
    let products=await productModel.find();
    res.render("shop",{products});
});
router.get("/account",isloggedin,async function(req,res){
    let user= await userModel.findOne({email:req.user.email});
    res.render("profile",{user});
    
})

router.post('/updateprofile', async(req, res) => {

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
module.exports=router;