const express=require("express");
const router=express.Router();
const isloggedin=require("../middlewares/isLoggedIn");
const {
    registerUser,
    loginUser,
    logout,
}=require("../controllers/authController");
const {sendOtp}=require("../utils/sendOtp");
const userModel = require("../models/user-model");

router.get("/",function(req,res){
    res.send("usersRouter")
});
// router.get("/register",function(req,res){
//     let otp=req.query.otp;
//     const { fullname = '', email = '' } = req.query;
//     otp="true";
//     let error=req.flash("error");
//     res.render("index",{error,loggedin:false,otp,fullname,email});
// })
router.post("/sendOtp", async (req, res) => {
    const { fullname, email, password } = req.body;
    let user=await userModel.findOne({email:email});
        if(user){
            req.flash("error","you alrady have an account, please log in");
            return res.redirect("/");
        } 

    // Generate and send OTP (You need to implement the OTP generation and email sending)
    const otp = Math.floor(100000 + Math.random() * 900000); // Example 6-digit OTP
    // Store OTP in session or database for verification
    req.session.otp = otp;
    req.session.email = email;
    req.session.fullname = fullname;
    req.session.password = password;

    await sendOtp(email, otp);

    // Redirect to the index page with otp set to true
    res.redirect(`/?otp=true&fullname=${encodeURIComponent(fullname)}&email=${encodeURIComponent(email)}`);
});
// router.post("/verifyOtp", async (req, res) => {
//     res.redirect("/users/register");
// });
router.post("/register", registerUser);

router.post("/login", loginUser);
router.get("/logout", logout);


module.exports=router;