const jwt=require("jsonwebtoken");
const ownerModel=require("../models/owner-model");

module.exports=async function (req,res,next) {
    if(!req.cookies.token){
        req.flash("error","you need to login first");
        return res.redirect("/owners/admin/login");
    }

    try{
        let decoded=jwt.verify(req.cookies.token,process.env.JWT_KEY);
        let owner=await ownerModel.findOne({email:decoded.email}).select("-password");
        if(!owner){
            req.flash("error","you need to login first");
            return res.redirect("/owners/admin/login");
        }
        req.owner=owner;
        next();
    }catch(err){
        req.flash("error","something went wrong.");
        res.redirect("/owners/admin/login");
    }
    
};