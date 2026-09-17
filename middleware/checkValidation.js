const {validationResult} = require('express-validator')
const {badRequest} = require('../errors')
const validate = (req,res,next)=>{
    const response = validationResult(req)
    if(response.isEmpty()){
        next()
    }
    else{
        let errors = response.array().map((err)=>{
            return `${err.msg} for ${err.path}`
        })
        throw new badRequest(errors)

    }
}
module.exports = validate