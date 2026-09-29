const {badRequest,authError} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const axios = require('axios')
const orderModel = require('../models/orderModel')
const crypto = require('crypto')


const initPayment = async (req,res)=>{
    const {UserId,email} = req.user
    const {orderId} = req.params
    let order = await orderModel.findOne({UserId,_id:orderId})
    console.log(UserId, orderId)
    if(!order) throw new badRequest("Order doesn't exist")
    const {totalCost} = order
    try {
         const response = await axios.post('https://api.paystack.co/transaction/initialize',
        {email,"amount":totalCost*100},
        {
            headers:{
                Authorization: `Bearer ${process.env.PAYSTACK_TESTKEY}`,
                "Content-Type": `application/json`
            }
        }
    )
    if(response.data.status!==true){
        return res.status(StatusCodes.BAD_REQUEST).json({message:response.data.message})
    }
    const {authorization_url,reference} = response.data.data
    order = await orderModel.findOneAndUpdate({UserId,_id:orderId},{orderRef:reference},{returnDocument:"after",runValidators:true})
    res.status(StatusCodes.OK).json({success:true,authUrl:authorization_url,message:"Payment successfully initialized"})
    } 
    catch (error) {
        throw error
    }
   
}
const verifyPayment = async(req,res)=>{
    const {reference} = req.params
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,{
        headers: {
            Authorization : `Bearer ${process.env.PAYSTACK_TESTKEY}`
        }
    })
    if(response.data.data.status!==true)throw new badRequest('Payment verification failed')
    const order = await orderModel.findOneAndUpdate({orderRef:reference},{orderStatus:"paid"},{returnDocument:'after',runValidators:true})
    if(!order) throw new badRequest('Order doesn\'t exist')
        return res.status(StatusCodes.OK).json({success:true,order,message:"Order paid for successfully"})
}

const confirmPaymentWebhook = async (req,res)=>{

    const paystackHash = req.headers['x-paystack-signature']
    const hash = crypto.createHmac('sha512',process.env.PAYSTACK_TESTKEY).update(req.body).digest('hex')
    if(hash!==paystackHash) throw new authErr('Invalid key')
    const {event} = JSON.parse(req.body)
    const {reference} = req.body.data
    let order
    if(event=== "charge.success"){
        order = await orderModel.findOneAndUpdate({orderRef:reference},{orderStatus:"paid"},{returnDocument:"after",runValidators:true})
        return res.status(StatusCodes.OK).json({success:true,order,message:"Order payment was successful"})
    }
    else{
        order = await orderModel.findOneAndUpdate({orderRef:reference},{orderStatus:"payment_failed"},{returnDocument:"after",runValidators:true})
        return res.status(StatusCodes.OK).json({success:true,order,message:"Order payment failed"})
    }
    
}
module.exports = {
    initPayment, verifyPayment, confirmPaymentWebhook
}