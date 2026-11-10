const {authError, badRequest} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const mailModel = require('../models/emailModel')
const crypto = require('crypto')
const sendMail = require('../middleware/sendEmail')
const {hashCode,compareCode} = require('../middleware/hash')

const updateProfile = async (req,res)=>{
    const {businessName,businessDescription,matricNum,university,department,faculty,studentEmail} = req.body
    const {UserId,role} = req.user
    if(role!=="vendor") throw new authError("You aren't authorised to access this route")
        const user = await userModel.findOneAndUpdate({_id:UserId},
    {businessName,businessDescription,matricNum,university,department,faculty,studentEmail},
    {returnDocument:"after",runValidators:true}).select("-password -__v")
    res.status(StatusCodes.OK).json({success:true,user,message:"Vendor profile updated successfully"})
}

const requestVerificationCode = async(req,res)=>{
    const {UserId} = req.user
    const student = await userModel.findOne({_id:UserId}).select("-password")
    const {studentEmail,role} = student
    if(!studentEmail) throw new badRequest("Please update profile with your student email")
    if(role!=="vendor") throw new authError("You aren't authorised to access this route")
        let code = crypto.randomInt(100000,1000000).toString()
    let hashedCode = await hashCode(code)
   await mailModel.create({userid:UserId,code:hashedCode,expiresAt: Date.now() + 600000})
   await sendMail(studentEmail,code)

   return res.status(StatusCodes.OK).json({success:true,user:student,message:"Check email for verification code"})
}

const verifyStudentEmail = async (req,res)=>{
    const {UserId} = req.user
    const {code} = req.body
    const mail = await mailModel.findOne({userid:UserId})
    if(!mail) throw new badRequest("User didn't request email verification")
        if(Date.now()>=mail.expiresAt){
             await mailModel.findOneAndDelete({userid:UserId})
             throw new badRequest('Time limit exceeded, request another verification code')
        }
        let temp = await mailModel.findOneAndUpdate({userid:UserId,attempts: {$lt:5}},{$inc:{attempts:1}},{returnDocument:"after"})
        if(!temp){ 
            await mailModel.findOneAndDelete({userid:UserId})
            throw new badRequest('Attempt limit exceeded, request another verification code')
        }
        let compareRes = await compareCode(code,mail.code)
    if(!compareRes){
         throw new badRequest('Invalid verification code')
    }
        await mailModel.findOneAndDelete({userid:UserId})
        let user = await userModel.findOneAndUpdate({_id:UserId},{isStudent:true},{returnDocument:'after',runValidators:true}).select("-password")
    return res.status(StatusCodes.OK).json({success:true,user,message:"Student email verified successfully"})
}


const listVendors = async (req,res)=>{
    let {status,page,limit,fields} = req.query
    if(fields){
        fields = fields.split(",").map((field)=>field.trim()).join(" ")
        field += " -password -__v"
    }
    else{
        fields = '-password -__v'
    }
    if(!page) page = 1
    if(!limit) limit = 5
    let amount = (page-1) * limit
    const vendors = await userModel.find({status:status || 'pending',role:"vendor",isStudent:true}).limit(limit).skip(amount).select(fields)

    res.status(StatusCodes.OK).json({success:true, vendors,message: "Vendors fetched successfully",noHits:vendors.length})
}
const getVendor = async (req,res)=>{
    const {vendorId} = req.params
    const vendor = await userModel.findOne({_id:vendorId}).select('-password -__v')
    if(!vendor) throw new badRequest("Vendor doesn't exist")
    res.status(StatusCodes.OK).json({success:true, vendor, message:"Vendor fetched successfully"})
}
const verifyVendor = async(req,res)=>{
    const {vendorId} = req.params
    const {status} = req.body
    const vendor = await userModel.findOneAndUpdate({_id:vendorId},{status},{returnDocument:"after",runValidators:true}).select("-password -__v")
    if(!vendor) throw new badRequest("Vendor doesn't exist")
    if(status==="rejected")res.status(StatusCodes.OK).json({success:true, vendor,message:"Vendor verification rejected"})
    else{
        res.status(StatusCodes.OK).json({success:true, vendor,message:"Vendor has been successfully verified"})
    }
}
const checkProfile = async (req,res)=>{
    const {UserId} = req.user
    const profile = await userModel.findOne({_id:UserId}).select('-password -__v')
    res.status(StatusCodes.OK).json({success:true, profile,message:"Vendor profile fetched successfully"})
}

const getPaidOrders = async (req,res)=>{
    const {role,UserId} = req.user
    if(role!=='vendor') throw new authError('User isn\'t authorised to use this route')
    const orders  = await orderModel.find({orderStatus:{$in:['paid','processing']},'vendorsInvolved.vendorId':UserId})
    if(!orders) throw new badRequest('No order involving this vendor has been paid for')
    console.log(orders)
    res.status(StatusCodes.OK).json({success:true,orders,message:"Paid orders fetched successfully",noHits:orders.length})

 
}

const processOrder = async (req,res)=>{
    const {UserId,role} = req.user
    const {orderId} = req.params
    if(role!=='vendor') throw new authError('You are not authorized to access this route')
    const order = await orderModel.findOneAndUpdate({'vendorsInvolved.vendorId':UserId,_id:orderId,orderStatus: {$in:['paid','processing']}},{$set:{'vendorsInvolved.$.packed':true},orderStatus:'processing'},{returnDocument:"after"})
    if(!order) throw new badRequest('This order hasn\'t been paid for')
    return res.status(StatusCodes.OK).json({success:true,order,message:"Order status changed to true"})
    
}

const listVendorsPublic = async (req,res)=>{
    const vendors = await userModel.find({role:vendor, status:verified})
    if(vendors.length === 0) return res.status(statusCodes.OK).json({success:true,vendors,message:`No vendors yet`})
    return res.status(statusCodes.OK).json({success:true,vendors,message:`Vendors fetched successfully`})
    
}
module.exports = {updateProfile,listVendors,verifyVendor,getVendor,checkProfile,
    getPaidOrders,processOrder,verifyStudentEmail,requestVerificationCode}