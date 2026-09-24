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

const checkOut = async (req, res) => {
  const { UserId, name } = req.user;
  const { idempotencykey } = req.headers;

  const cart = await cartModel.findOne({ UserId }).populate("items.productId");
  if (!cart) throw new badRequest("User doesn't have a cart");
  const { items } = cart;

  const totalCost = items.reduce((total, item) => {
    return total + (item.productId.price * item.quantity);
  }, 0);

  const session = await mongoose.startSession();
  session.startTransaction();

  let order;
  try {
    // 1. Deduct stock, one item at a time — sequential, not Promise.all
    for (const item of items) {
      const updatedProduct = await productModel.findOneAndUpdate(
        { _id: item.productId._id, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity } },
        { session, returnDocument: "after" }
      );
      if (!updatedProduct) {
        throw new badRequest(`Not enough stock for ${item.productId.name}`);
      }
    }

    // 2. Create the order (array syntax required when passing a session)
    const created = await orderModel.create([{ UserId, totalCost, CustomerName: name }], { session });
    order = created[0];

    // 3. Clear the cart
    await cartModel.findOneAndDelete({ UserId }, { session });

    // 4. Mark idempotency record complete
    await idempModel.findOneAndUpdate(
      { key: idempotencykey },
      { status: "Complete", orderId: order._id },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    await idempModel.findOneAndDelete({ key: idempotencykey }); // outside the aborted transaction
    throw error;
  } finally {
    session.endSession();
  }

  res.status(StatusCodes.OK).json({ success: true, order, message: `Purchases made successfully` });
};
module.exports = {addToCart,getCart,checkOut}