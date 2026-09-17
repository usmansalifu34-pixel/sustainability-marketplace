const {StatusCodes} = require('http-status-codes')
const {badRequest,authError,notFound} = require('../errors')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const orderModel = require('../models/orderModel')
const idempModel = require('../models/idempotencyObject')
const addToCart = async (req,res)=>{
    const {id,quantity} = req.body
    const {UserId} = req.user
    
    const product = await productModel.findOne({_id:id})
    if(!product) throw new notFound("Product doesn't exist in database")
        if(quantity>product.stockQuantity) throw new badRequest(`Requested product quantity exceeds available stock`)
    let cart = await cartModel.findOneAndUpdate({UserId,"items.productId":id},{$inc:{"items.$.quantity":quantity}},{returnDocument:"after"})
    if(!cart){
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

const checkOut = async (req,res) =>{
    const {UserId,name} = req.user
    const {idempotencyKey} = req.headers
    let cart = await cartModel.findOne({UserId}).populate("items.productId")
    if(!cart) throw new badRequest("User doesn't have a cart")
    const {items} = cart
    
    const totalCost = items.reduce((total,nextItem)=>{
        return total + (nextItem.productId.price *nextItem.quantity)
    },0)
    console.log(totalCost)
    await Promise.all(items.map(async (item) => {
  const updatedProduct = await productModel.findOneAndUpdate(
    { _id: item.productId._id, stockQuantity: { $gte: item.quantity } },
    { $inc: { stockQuantity: -item.quantity } },
    {returnDocument:"after"}
  );
  if (!updatedProduct) {
        await productModel.findOneAndUpdate(
    { _id: item.productId._id, stockQuantity: { $gte: item.quantity } },
    { $inc: { stockQuantity: stockQuantity+item.quantity } },
    {returnDocument:"after"}
  );
        await idempModel.findOneAndDelete({idempotencyKey})
        throw new badRequest(`Not enough stock for ${item.productId.name}`);
}
}));
    cart = await cartModel.findOneAndDelete({UserId})
    const order = await orderModel.create({UserId,totalCost,CustomerName:name})
    await idempModel.findOneAndDelete({idempotencyKey})
    res.status(StatusCodes.OK).json({success:true,order,message:`Purchases made successfully`})
}

module.exports = {addToCart,getCart,checkOut}