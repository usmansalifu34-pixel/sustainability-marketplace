const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    name:{type:String, required:[true,"Please enter your name"]},
    password: {type:String, required:[true,"Please enter your password"], minLength:6},
    email:{type:String, required: [true,"Please enter an email"],unique:true,match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,"Please enter a valid email"]},
    role: {type:String, default: "customer", enum:["customer","vendor","admin"]},
    status: {type:String,default: "verified", enum: ["verified","pending","rejected"]},
    businessName: {type:String},
    businessDescription: {type:String, maxLength: 250}
})

userSchema.pre('save',async function(){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})
userSchema.methods.createJWT = function(){
    return jwt.sign({name:this.name,role:this.role,email:this.email,UserId:this._id,status:this.status},process.env.jwt_secret,{expiresIn:process.env.jwt_lifetime})
}
userSchema.methods.comparePassword = async function(testPassword){
    const isMatch = await bcrypt.compare(testPassword,this.password)
    return isMatch
}
module.exports = mongoose.model('User',userSchema)