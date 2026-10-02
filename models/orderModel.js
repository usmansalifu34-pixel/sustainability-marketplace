const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    UserId: {type:mongoose.Schema.Types.ObjectId,required:true},
    totalCost:{type:Number,required:true},
    CustomerName:{type:String, required:true},
    vendorsInvolved:[{vendorId:{ type: mongoose.Schema.Types.ObjectId}}],
    orderStatus: {
    type: String,
    enum: ['pending_payment', 'payment_failed','paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending_payment'
    },
    orderRef: {type:String},
    paymentUrl:{type:String}
})
module.exports = mongoose.model("Order",orderSchema)