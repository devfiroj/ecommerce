const userModel=require("../models/user-model");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const {generateTooken}=require("../utils/generateTokens");
const ownerModel = require("../models/owner-model");
const {generateTooken1}=require("../utils/generateTokens");


const registerUser=async function(req,res){
    try{
        let {fullname,email,password}=req.body;
        let user=await userModel.findOne({email:email});
        if(user){
            req.flash("error","you alrady have an account, please log in");
            return res.redirect("/");
        } 

        bcrypt.genSalt(10,function(err,salt){
            bcrypt.hash(password,salt,async function(err,hash){
                if (err) return res.send(err.message);
                else {
                    let user =await userModel.create({
                        fullname,
                        email,
                        password:hash,
                    });
                    let token=generateTooken(user);
                    res.cookie("token",token);
                    //req.flash("success","user created succesfully");
                    return res.redirect("/");
                }
            });
        });

        
    }catch(err){
        res.send(err.message);
    } 
}
module.exports.registerUser=registerUser;

module.exports.loginUser=async function(req,res){
    let {email,password}=req.body;
    let user=await userModel.findOne({email:email});
    if(!user){
        req.flash("error","Email or password incorrect");
        return res.redirect("/");
    } 
    bcrypt.compare(password,user.password,function(err,result){
        if(result){
            let token=generateTooken(user);
            res.cookie("token",token);
            res.redirect("/shop");
        }
        else{
            req.flash("error","Email or password incorrect");
            return res.redirect("/");
        }
    });
};

module.exports.logout=function (req, res){
    res.cookie("token","");
    res.redirect("/");
};



//owner Auth

module.exports.loginOwner=async function(req,res){
    let {email,password}=req.body;
    let owner=await ownerModel.findOne({email:email});
    if(!owner){
        req.flash("error","Email or password incorrect");
        return res.redirect("/owners/admin/login");
    } 
    
    if(owner.password===password){    
        let token=generateTooken1(owner);
        res.cookie("token",token);
        res.redirect("/owners/admin/orders");
    }
    else{
        req.flash("error","Email or password incorrect");
        return res.redirect("/owners/admin/login");
    }
};

module.exports.ownerlogout=function (req, res){
    res.cookie("token","");
    res.redirect("/owners/admin/login");
};