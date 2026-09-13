const {StatusCodes} = require('http-status-codes')
const errorHandler = (err,req,res,next)=>{
    let customErr = {
        message : err.message,
        statusCode:err.statusCode || 500
    }
    if(err.code===11000){
        const {keyValue} = err
        const duplicates = Object.keys(keyValue)
        customErr.message = `${duplicates} already exists in database`
        customErr.statusCode = StatusCodes.BAD_REQUEST
    }
    //console.log(err.statusCode)
    //res.status(customErr.statusCode).json(err)
    res.status(customErr.statusCode).json({message:customErr.message})
}
module.exports = errorHandler