const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    UserId: {type:mongoose.Schema.Types.ObjectId,required:true},
    totalCost:{type:Number,required:true},
    CustomerName:{type:String, required:true},
    vendorsInvolved:[{vendorId:{ type: mongoose.Schema.Types.ObjectId}}],
    items: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
          vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          quantity: { type: Number, required: true }
        }
      ]
    ,
    orderStatus: {
    type: String,
    enum: ['pending_payment', 'payment_failed','paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending_payment'
    },
    orderRef: {type:String},
    paymentUrl:{type:String}
})
module.exports = mongoose.model("Order",orderSchema)