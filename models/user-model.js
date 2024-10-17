const mongoose=require("mongoose")


const userSchema=mongoose.Schema({
    fullname:{
        type:String,
        minLength: 3,
        trim:true,
    },
    email:String,
    password:String,
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,  // default quantity is 1
        }
    }],
    isAdmin:Boolean,
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"order"
    }],
    contact:Number,
    address:String,
    picture:String,
});

module.exports=mongoose.model("user",userSchema);
