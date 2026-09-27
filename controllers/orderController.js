const {badRequest} = require('../errors')
const{StatusCodes} = require('http-status-codes')
const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')

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

const getOrder = async (req,res)=>{
    const {orderId} = req.params
    const {UserId} = req.user
    const order = await orderModel.findOne({_id:orderId,UserId})
    if(!order) throw new badRequest("This order doesn't exist")
    return res.status(StatusCodes.OK).json({success:true, order,message:"Order fetched successfully"})
}
module.exports = {createOrder,getAllOrders,getOrder}