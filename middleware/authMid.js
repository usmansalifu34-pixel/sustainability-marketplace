const jwt = require('jsonwebtoken')
const {authError} = require('../errors')
const model = require('../models/userModel')
const authMid = async (req,res,next)=>{
    const authHeader = req.headers.authorization
    if(!authHeader||!authHeader.startsWith('Bearer '))throw new authError('Invalid token')
    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token,process.env.jwt_secret)
        const user = await model.findOne({email:payload.email})
        if(!user)throw new authError('User doesn\'t exist')
        req.user = {
            name: payload.name,
            email: payload.email,
            role: payload.role,
            UserId:payload.UserId
    }

    next()
    } 
    catch (error) {
        if(error instanceof(authError)) throw new authError('User doesn\'t exist')
        throw new authError('Invalid token')
    }
}
module.exports = authMid