const {badRequest,authError} = require('../errors')
const{StatusCodes} = require('http-status-codes')
const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const idempModel = require('../models/idempotencyObject')
const productModel = require('../models/productModel')

const mongoose = require('mongoose')
const getAllOrders = async (req,res)=>{
    const {UserId} = req.user
    let {select,page,count} = req.query
    if(select){
        select = select.split(',').map((element)=>element.trim()).join(' ')
    }
    if(!page) page = 1
    if(!count) count = 5
    let amount = (page-1) * count
    const orders = await orderModel.find({UserId}).select(select).skip(amount).limit(count)
    if(!orders) throw new badRequest('User hasn\'t made any orders')
    return res.status(StatusCodes.OK).json({success:true,orders,message:"User's orders fetched successfully",noHits:orders.length})
}

const createOrder = async (req, res) => {
  const { UserId, name } = req.user;
  const { idempotencykey } = req.headers;

  const cart = await cartModel.findOne({ UserId }).populate("items.productId");
  if (!cart) throw new badRequest("User doesn't have a cart");
  const { items } = cart;
  const vendorsInvolved = []
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
            
      if(!vendorsInvolved.some((vendor)=>vendor.vendorId.toString()===item.vendor.toString()))vendorsInvolved.push({vendorId:item.vendor})
    }

    // 2. Create the order (array syntax required when passing a session)
    const created = await orderModel.create([{ UserId, totalCost, CustomerName: name,items,vendorsInvolved }], { session });
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

const getOrder = async (req,res)=>{
    const {orderId} = req.params
    const {UserId} = req.user
    const order = await orderModel.findOne({_id:orderId,UserId})
    if(!order) throw new badRequest("This order doesn't exist")
    return res.status(StatusCodes.OK).json({success:true, order,message:"Order fetched successfully"})
}

const shipOrders = async (req,res)=>{
  const{UserId, role} = req.user
  const {orderId} = req.params
  if(role!=='admin') throw new authError("Only admins can access this route")
    let order = await orderModel.findOne({_id:orderId}).select('vendorsInvolved')
    if(!order) throw new badRequest('order doesn\'t exist')
  order.vendorsInvolved.forEach((vendorInvolved)=>{
    if(vendorInvolved.packed!== true) throw new badRequest("Unable to ship products because not all vendors have packed their orders")
  })
  order = await orderModel.findOneAndUpdate({_id:orderId,orderStatus:"processing"},{orderStatus:'shipped'},{returnDocument:'after'})
  if(!order) throw new badRequest(`Order can't be shipped`)
  return res.status(StatusCodes.OK).json({success:true,order,message:"Products shipped successfully"})
}

const orderDelivered = async (req,res)=>{
  const {orderId} = req.params
  const {role} = req.user
  if(role!=='admin') throw new authError("You are not authorised to access this route")
  const order = await orderModel.findOneAndUpdate({_id:orderId,orderStatus:'shipped'},{orderStatus:'delivered'},{returnDocument:"after"})
  if(!order) throw new badRequest('This order has not been shipped')
    return res.status(StatusCodes.OK).json({success:true,order,message:"Order delivered successfully"})
}

const orderRecieved = async(req,res)=>{
  const {UserId} = req.user
  const {orderId} = req.params
  const order = await orderModel.findOneAndUpdate(
                {UserId,_id:orderId,orderStatus:'delivered'},
                {orderStatus:'completed'},
                {returnDocument:"after"})
  if(!order) throw new badRequest('User doesn\'t have a delivered order')
    return res.status(StatusCodes.OK).json({success:true, order, message:"Order received successfully"})
}

const cancelOrder = async (req,res)=>{
  const {UserId} = req.user
  const {orderId} = req.params
  const order = await orderModel.findOneAndUpdate(
                  {UserId,_id:orderId,orderStatus:{$in: ['pending_payment', 'payment_failed','paid', 'processing','shipped']}},
                  {orderStatus:'cancelled'},
                  {returnDocument:'after'})
  if(!order) throw new badRequest('Order cannot be cancelled')

  const {items} = order
  for(let item of items){
   
    let product  = await productModel.findOneAndUpdate({_id:item.productId},
      {$inc: {stockQuantity: item.quantity}},
      {returnDocument:'after'})
   
  }

    return res.status(StatusCodes.OK).json({success:true, order, message:"Order cancelled successfully"})
}
module.exports = {createOrder,getAllOrders,getOrder,shipOrders,orderDelivered,orderRecieved,cancelOrder}