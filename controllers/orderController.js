const {} = require('../errors')
const{StatusCodes} = require('http-status-codes')
const orderModel = require('../models/orderModel')



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

module.exports = {checkOut}