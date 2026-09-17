const idempModel = require('../models/idempotencyObject')
const orderModel = require('../models/orderModel')
const {badRequest} = require('../errors')
const {StatusCodes} = require('http-status-codes')

const getKey = async (req,res,next)=>{
    const {idempotencyKey} = req.headers
    const idempObject = await idempModel.findOne({key:idempotencyKey})
    if(!idempObject){
        await idempModel.create({key:idempotencyKey,status:"Pending"})
        next()
    }
    else{
        if(idempObject.status==='pending') throw new StatusCodes.CONFLICT
        const order = await orderModel.findOne({_id:idempObject.orderId})
        res.status(StatusCodes.OK).json({success:true, order, message:`Order made successfully`})
    }
}