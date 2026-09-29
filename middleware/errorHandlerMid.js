const { StatusCodes } = require('http-status-codes')
const customError  = require('../errors/createCustomError')
const errorHandler = (err,req,res,next)=>{
    //console.log(err.message);
    
    let customErr = {
        statusCode:err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message|| 'Something went wrong'
    }

    if(err.name==='ValidationError'){
        customErr.msg = Object.values(err.errors).map((item)=>item.message).join(',')
        customErr.statusCode = 400
    }
    if(err.name==='CastError'){
        customErr.msg  = `No item found with id :${err.value}`
        customErr.statusCode = 404
    }

    if(err.code && err.code ===11000 ){
        customErr.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`
        customErr.statusCode = 400
    }
    console.log(err)
     //return res.status(customErr.statusCode).json(err)
    return res.status(customErr.statusCode).json(customErr)
}

module.exports = errorHandler