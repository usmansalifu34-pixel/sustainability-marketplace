const {badRequest} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const axios = require('axios')
const orderModel = require('../models/orderModel')
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

module.exports = {
    initPayment
}