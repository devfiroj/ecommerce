const express=require("express");
const router=express.Router();
const upload=require("../config/multer-config");
const productModel=require("../models/product-model");
const ownerisloggedin=require("../middlewares/ownerIsLoggedIn");


router.post("/create",ownerisloggedin,upload.single("image"),async function(req,res){
    
    try{let {name,price,discount,bgcolor,panelcolor,textcolor} = req.body;
    let product =  await productModel.create({
        image: req.file.buffer,
        name,
        price,
        discount,
        bgcolor,
        panelcolor,
        textcolor

    });
    req.flash("success","product created successfully.");
    res.redirect("/owners/admin");}
    catch(err){
        res.send(err.message);
    }
});

module.exports=router;