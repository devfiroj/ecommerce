const express=require("express");
const router=express.Router();
const ownerModel=require("../models/owner-model");
const orderModel = require('../models/order-model');


process.env.NODE_ENV = "development"
if(process.env.NODE_ENV === "development"){
    router.post("/create",async function(req,res){
        let owners=await ownerModel.find();
        if(owners.length>0) return res.status(503).send("you dont have permision to create owner.");

        let {fullname,email,password}=req.body;
        let createdOwner=await ownerModel.create({
            fullname,
            email,
            password,
        });
        res.status(201).send(createdOwner);
    });
}
router.get("/admin",function(req,res){
    let success = req.flash("success")
    res.render("createproducts",{success});
});

//process.env.NODE_ENV="development";
//console.log(process.env.NODE_ENV);





// GET: Admin order dashboard
router.get('/admin/orders', async (req, res) => {
    try {
        // Fetch all orders from the database, sorted by 'placedAt' in descending order
        const orders = await orderModel.find()
            .populate({
                path: 'user', // Populate user details
            })
            .populate({
                path: 'products.product', // Populate product details inside products array
                model: 'product',
            })
            .sort({ placedAt: -1 }); // Sort by 'placedAt' in descending order (latest first)

        res.render('orderDashboard', { orders });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/admin/orders/update/:id', async (req, res) => {
    const { orderStatus } = req.body;

    try {
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update order status
        order.orderStatus = orderStatus;
        await order.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: 'Error updating order status' });
    }
});

module.exports=router;