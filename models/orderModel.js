const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    UserId: {type:mongoose.Schema.Types.ObjectId,required:true},
    totalCost:{type:Number,required:true},
    CustomerName:{type:String, required:true},
    orderStatus: {
    type: String,
    enum: ['pending_payment', 'payment failed','paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending_payment'
    },
    orderRef: {type:String}
})
module.exports = mongoose.model("Order",orderSchema)