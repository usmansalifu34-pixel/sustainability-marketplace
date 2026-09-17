const mongoose = require('mongoose')
const objectSchema = new mongoose.Schema({
    key: {type:String, required:[true,"Enter idempotency key"]},
    status: {type:String, required:[true,"What's the status of this request?"], enum: ["Pending","Complete"]},
    orderId: {type:mongoose.Schema.Types.ObjectId}
})

module.exports = mongoose.model("idempotencyObject",objectSchema)