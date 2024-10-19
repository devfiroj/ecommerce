const jwt=require("jsonwebtoken");

const generateTooken=(user)=>{
    return jwt.sign({email:user.email,id:user._id},process.env.JWT_KEY);
};
module.exports.generateTooken=generateTooken;

const generateTooken1=(owner)=>{
    return jwt.sign({email:owner.email,id:owner._id},process.env.JWT_KEY);
};
module.exports.generateTooken1=generateTooken1;
