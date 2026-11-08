const mongoose = require('mongoose')

let emailSchema = new mongoose.Schema({
    userid: {type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    code: {type: String, required:true},
    expiresAt:{type:Date,required:true,expires:0}
})

module.exports = mongoose.model('Email',emailSchema)