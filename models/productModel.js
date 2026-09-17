const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name:{type:String, required:[true,"Enter product name"]},
    price: {type:Number, required:[true,"Enter product cost"]},
    image: {type:String},
    description: {type:String, required:[true,"Add a bried description of the product"], maxLength:160},
    stockQuantity:{type:Number,required:[true,"Please enter stock quantity of product"]},
    vendor: {type:mongoose.Schema.Types.ObjectId,ref:"User", required:true}
})

module.exports = mongoose.model('Product',productSchema)