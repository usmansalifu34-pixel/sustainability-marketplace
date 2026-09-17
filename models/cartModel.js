const mongoose  = require('mongoose')
const cartSchema = new mongoose.Schema({
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      quantity: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Cart",cartSchema)