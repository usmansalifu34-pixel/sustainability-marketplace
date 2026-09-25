const {authError, badRequest} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const userModel = require('../models/userModel')

const updateProfile = async (req,res)=>{
    const {businessName,businessDescription} = req.body
    const {UserId,role} = req.user
    if(role!=="vendor") throw new authError("You aren't authorised to access this route")
        const user = await userModel.findOneAndUpdate({_id:UserId},{businessName,businessDescription},{returnDocument:"after"})
    res.status(StatusCodes.OK).json({success:true,vendor:user,message:"Vendor profile updated successfully"})
}
const listVendors = async (req,res)=>{
    let {status,page,limit,fields} = req.query
    if(fields){
        fields = fields.split(",").map((field)=>field.trim()).join(" ")
    }
    if(!page) page = 1
    if(!limit) limit = 5
    let amount = (page-1) * limit
    const vendors = await userModel.find({status:status || 'pending',role:"vendor"}).limit(limit).skip(amount).select(fields)
    res.status(StatusCodes.OK).json({success:true, vendors,message: "Vendors fetched successfully",noHits:vendors.length})
}
const getVendor = async (req,res)=>{
    const {vendorId} = req.params
    const vendor = await userModel.findOne({_id:vendorId})
    if(!vendor) throw new badRequest("Vendor doesn't exist")
    res.status(StatusCodes.OK).json({success:true, vendor, message:"Vendor fetched successfully"})
}
const verifyVendor = async(req,res)=>{
    const {vendorId} = req.params
    const {status} = req.body
    const vendor = await userModel.findOneAndUpdate({_id:vendorId},{status},{returnDocument:"after",runValidators:true})
    if(!vendor) throw new badRequest("Vendor doesn't exist")
    if(status==="rejected")res.status(StatusCodes.OK).json({success:true, vendor,message:"Vendor verification rejected"})
    else{
        res.status(StatusCodes.OK).json({success:true, vendor,message:"Vendor has been successfully verified"})
    }
}
const checkProfile = async (req,res)=>{
    const {UserId} = req.user
    const profile = await userModel.findOne({_id:UserId})
    res.status(StatusCodes.OK).json({success:true, profile,message:"Vendor profile fetched successfully"})
}
module.exports = {updateProfile,listVendors,verifyVendor,getVendor,checkProfile}