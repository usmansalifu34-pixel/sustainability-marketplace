const idempModel = require('../models/idempotencyObject')
const orderModel = require('../models/orderModel')
const {badRequest} = require('../errors')
const {StatusCodes} = require('http-status-codes')


const getKey = async (req,res,next)=>{
    const {idempotencykey} = req.headers
    //console.log(idempotencykey)
    const idempObject = await idempModel.findOne({key:idempotencykey})
    if(!idempObject){
        await idempModel.create({key:idempotencykey,status:"Pending"})
        next()
    }
    else{
        if(idempObject.status==='Pending') throw new StatusCodes.CONFLICT
        const order = await orderModel.findOne({_id:idempObject.orderId})
        res.status(StatusCodes.OK).json({success:true, order, message:`Order made successfully`})
    }
}
module.exports = getKey