const {StatusCodes} = require('http-status-codes')
const {badRequest,authError,notFound} = require('../errors')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const mongoose = require('mongoose')
const orderModel = require('../models/orderModel')
const idempModel = require('../models/idempotencyObject')


const addToCart = async (req,res)=>{
  //Get input data from request body
    const {id,quantity} = req.body
    const {UserId} = req.user //get the id of the current logged-in user
    if(quantity<1) throw new badRequest('Expected positive value for quantity') //data validation
    const product = await productModel.findOne({_id:id}) //Getting the product the user wants to add to cart
    if(!product) throw new notFound("Product doesn't exist in database") //confirming the product exists
       if(quantity>product.stockQuantity) throw new badRequest(`Requested product quantity exceeds available stock`) //Ensures requested quantity doesn't exceed stock quantity
    let cart = await cartModel.findOne({UserId}) //finds the user's cart
  if(cart){

    const {items} = cart //gets the items in the cart
    const cartProd = items.find((item)=>{ //Checks if the product the user wants to add is in the user's cart
      
      return item.productId.toString() === id
    })

    if(cartProd){
      //If the product is in the cart then checks if that quantity + the requested quantity exceeds stock quantity, if it doesn't then it just increases the quantity of the product in the cart
      if(cartProd.quantity + quantity > product.stockQuantity) throw new badRequest(`Requested product quantity exceeds available stock`)
      cart = await cartModel.findOneAndUpdate({UserId,"items.productId":id},{$inc: {"items.$.quantity":quantity}},{returnDocument: "after"})
    }
    else{
      //if the product wasn't already in the user's cart then push it to cart, 
        cart = await cartModel.findOneAndUpdate({UserId},{$push:{items: {productId:id,vendor:product.vendor,quantity}}},{returnDocument:"after"})
    }
  }
    
    else{ //if the user doesn't have a cart then "upsert" would make a cart for the user then push that product to it
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

  const {UserId} = req.user //Get the id of the current user

    const cart  = await cartModel.findOneAndDelete({UserId}) //deletes the user's cart
  if(!cart) throw new badRequest('User doesn\'t have a cart to delete') //throw an error if the user has no cart
    return res.status(StatusCodes.OK).json({success:true,deleted_cart:cart,message:"Cart deleted successfully"})
}
const deleteFromCart = async (req,res)=>{
  const {productId} = req.params
  const {UserId} = req.user
  let cart = await cartModel.findOne({UserId})
  if(!cart) throw new badRequest('User doesn\'t have a cart')
    let {items} = cart
  let prod = items.find((item)=>item.productId.toString()===productId)
  if(!prod) throw new badRequest('Item doesn\'t exist in cart')
  cart  = await cartModel.findOneAndUpdate({UserId},{$pull:{items:{productId}}},{returnDocument:"after"})
    if(cart.items.length===0){
      await cartModel.findOneAndDelete({UserId})
      return res.status(StatusCodes.OK).json({success:true,cart,message:"Cart emptied and deleted successfully"})
    }
    return res.status(StatusCodes.OK).json({success:true,cart,message:"Cart updated successfully"})
}


const deductFromCart = async (req,res)=>{
  const {productId}  = req.params
  const {UserId} = req.user
  const {quantity} = req.body
  if(quantity<1) throw new badRequest('Expected positive number for quantity')
  let cart = await cartModel.findOne({UserId})
  if(!cart) throw new badRequest('User doesn\'t have a cart')
  const {items} = cart
  const product = items.find((item)=>item.productId.toString() === productId)
  
  if(!product) throw new badRequest('This item isn\'t in your cart')
  const prodQuantity = product.quantity

  if(quantity>prodQuantity) throw new badRequest('Specified quantity to delete exceeds quantity of product present in the cart')
  else if(quantity===prodQuantity){
        cart = await cartModel.findOneAndUpdate({UserId},{$pull:{items:{productId}}},{returnDocument:"after"})
        if(items.length===1){
          cart = await cartModel.findOneAndDelete({UserId})
          return res.status(StatusCodes.OK).json({success:true,cart,message:`Cart deleted successfully`})
        }
        return res.status(StatusCodes.OK).json({success:true,cart,message:`product deducted successfully`})
  }
  else{
    cart = await cartModel.findOneAndUpdate({UserId,'items.productId':productId},{$inc: {'items.$.quantity':-quantity}},{returnDocument:"after"})
    return res.status(StatusCodes.OK).json({success:true,cart,message:"Cart data updated successfully"})
  }


}
module.exports = {addToCart,getCart,deleteCart,deleteFromCart,deductFromCart}