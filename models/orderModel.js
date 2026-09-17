const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    UserId: {type:mongoose.Schema.Types.ObjectId,required:true},
    totalCost:{type:Number,required:true},
    CustomerName:{type:String, required:true}
})
module.exports = mongoose.model("Order",orderSchema)