const {StatusCodes} = require('http-status-codes')
const {badRequest,authError,notFound} = require('../errors')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const mongoose = require('mongoose')
const orderModel = require('../models/orderModel')
const idempModel = require('../models/idempotencyObject')
const { findOneAndUpdate } = require('../models/userModel')
const addToCart = async (req,res)=>{
    const {id,quantity} = req.body
    const {UserId} = req.user
    
    const product = await productModel.findOne({_id:id})
    if(!product) throw new notFound("Product doesn't exist in database")
        // if(quantity>product.stockQuantity) throw new badRequest(`Requested product quantity exceeds available stock`)
    let cart = await cartModel.findOne({UserId})
  if(cart){

    const {items} = cart
    const cartProd = items.find((item)=>{
      
      return item.productId.toString() === id
    })
    if(cartProd){

      if(cartProd.quantity + quantity > product.stockQuantity) throw new badRequest(`Requested product quantity exceeds available stock`)
      cart = await cartModel.findOneAndUpdate({UserId,"items.productId":id},{$inc: {"items.$.quantity":quantity}},{returnDocument: "after"})
    }
    else{
        cart = await cartModel.findOneAndUpdate({UserId},{$push:{items: {productId:id,vendor:product.vendor,quantity}}},{returnDocument:"after",upsert:true})
    }
  }
    
    else{
        cart = await cartModel.findOneAndUpdate({UserId},{$push:{items: {productId:id,vendor:product.vendor,quantity}}},{returnDocument:"after",upsert:true})
    }
    res.status(StatusCodes.OK).json({success:true,cart,message:`Product added to cart`})
}
const getCart = async (req,res)=>{
    const {UserId} = req.user
    //const {id} = req.params
    const cart = await cartModel.findOne({UserId}).populate("items.productId", "name image price").populate("items.vendor", "name email")
    if(!cart) throw new badRequest('User doesn\'t have a cart')
        res.status(StatusCodes.OK).json({success:true, cart,message:`Cart fetched successfully`})

}
const deleteCart = async (req,res)=>{
  const {cartId} = req.params
  const {UserId} = req.user
  if(!cartId) throw new badRequest("Cart id expected")
    const cart  = await cartModel.findOneAndDelete({_id:cartId,UserId})
  if(!cart) throw new badRequest('User doesn\'t have a cart to delete')
    return res.status(StatusCodes.OK).json({success:true,deleted_cart:cart,message:"Cart deleted successfully"})
}
module.exports = {addToCart,getCart,deleteCart}