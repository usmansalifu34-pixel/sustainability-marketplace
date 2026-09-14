const model = require('../models/userModel')
const {StatusCodes} = require('http-status-codes')
const {badRequest,notFound,authError} = require('../errors')
const register = async (req,res)=>{
    const {name,email,password,role} = req.body
    if(!name||!email||!password)throw new badRequest('Please enter all required details')
    const user = await model.create(req.body)
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({success:true,user:{name,email,role},token,message:`User created successfully`})
}
const login = async(req,res)=>{
    const {email,password} = req.body
    if(!email || !password)throw new badRequest('Please enter login details')
    const user = await model.findOne({email})
    if(!user)throw new badRequest('User doesn\'t exist in database')
    const isMatch = await user.comparePassword(password)
    if(!isMatch) throw new badRequest('Wrong password')
    const token = user.createJWT()
    res.status(StatusCodes.OK).json({success:true,user:{name:user.name,email,role:user.role,userID:user._id},token,message:`Login successful`})
}
module.exports = {register,login}