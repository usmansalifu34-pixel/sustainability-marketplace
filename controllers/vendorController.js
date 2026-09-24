const {authError} = require('../error')
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
    const {status} = req.query
    const vendors = await find({status:status || 'pending',role:"vendor"})
    res.status(StatusCodes.OK).json({success:true, vendors,message: "Vendors fetched successfully",noHits:vendors.length})
}
const verifyUser = async(req,res)=>{
    
}
module.exports = {updateProfile,listVendors}