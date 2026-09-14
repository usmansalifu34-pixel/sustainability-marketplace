const {validationResult} = require('express-validator')
const {badRequest} = require('../errors')
const validate = (req,res,next)=>{
    const response = validationResult(req)
    if(response.isEmpty()){
        next()
    }
    else{
        throw new badRequest(response.array())
    }
}
module.exports = validate