const mongoose = require('mongoose')

let emailSchema = new mongoose.Schema({
    userid: {type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    code: {type: Number, required:true}
})

module.exports = mongoose.model('Email',emailSchema)