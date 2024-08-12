const express=require("express");
const router=express.Router();
const isloggedin=require("../middlewares/isLoggedIn");
//const {registerUser,loginUser}=require("../controllers/authController");
const {
    registerUser,
    loginUser,
    logout,
}=require("../controllers/authController");

router.get("/",function(req,res){
    res.send("usersRouter")
});

router.post("/register", registerUser);

router.post("/login", loginUser);
router.post("/logout", logout);

module.exports=router;