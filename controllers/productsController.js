const {badRequest,authError,notFound} = require('../errors')
const {S3Client,PutObjectCommand,DeleteObjectCommand} = require('@aws-sdk/client-s3')
const {StatusCodes} = require('http-status-codes')
const model = require('../models/productModel')

const client = new S3Client({
    region:"us-east-1",
    credentials:{
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
    }
})

const createProduct = async(req,res)=>{
    const {role,UserId,status} = req.user
    //console.log(req.file)
    const {quantity} = req.body
    if(role!=='vendor'|| status!=="verified") throw new authError('You are not authorized or verified to access this route')
    const key = `${req.file.originalname}-${Date.now()}`
    const command = new PutObjectCommand({
        Body: req.file.buffer,
        Bucket: "sustainability-market-images",
        Key: key,
        ContentType:req.file.mimetype
    })
    const result = await client.send(command)
    //console.log(result)

    const imageUrl = `https://sustainability-market-images.s3.us-east-1.amazonaws.com/${key}`
    const product = await model.create({...req.body,image:imageUrl,vendor:UserId,stockQuantity:quantity,status:"pending"})
    res.status(StatusCodes.CREATED).json({success:true,product,message:`Product was successfully created`})
}
const getProducts = async (req,res)=>{
    let {price,sort,filter,name,page,amount} = req.query
    const queryObject = {status:"verified"}
    if(name){
        queryObject.name = {$regex: name,$options: "i"}
    }
    if(price){
        queryObject.price = price
    }
    let products = model.find(queryObject)
    if(filter){
        filter = filter.split(',').map((item)=>item.trim()).join(' ')
        products = products.select(filter)
    }
    if(sort){
        sort = sort.split(',').map((item)=>item.trim()).join(' ')
        products = products.sort(sort)
    }
    if(!page) page = 1
    if(!amount) amount = 5
    const count = (page - 1)* amount
    const result = await products.skip(count).limit(amount)
    res.status(StatusCodes.OK).json({success:true,products:result,message:`Products fetched successfully`,nbHits:result.length})
}
const deleteProduct = async (req,res)=>{
    const {role,UserId} = req.user
    const {id} = req.params
    if(role!=='vendor') throw new authError('You are not authorized to access this route')
        const product = await model.findOneAndDelete({_id:id,vendor:UserId})
    if(!product) throw new notFound("Product doesn't exist in database")
        const {image} = product
    //console.log(image, product)
    const key = image.slice((image.lastIndexOf('/')+1))

    const command = new DeleteObjectCommand({
        Bucket: "sustainability-market-images",
        Key: key
    })
    const response = await client.send(command)
        res.status(StatusCodes.OK).json({success:true,product,message:`Product deleted successfully`})
}
const getProduct = async(req,res)=>{
    const {id} = req.params
    const product = await model.findOne({_id:id,status:"verified"})
    if(!product) throw new notFound("Product doesn't exist")

    res.status(StatusCodes.OK).json({success:true,product,message:`Product fetched successfully`})
}

const updateProduct = async (req,res)=>{
    const {role,UserId} = req.user
    const {id} = req.params
    if(role!=='vendor') throw new authError("You are not authorized to access this route")
        let product
    if(req.file) {
        const{buffer} = req.file
            
            let prod = await model.findOne({_id:id})
            if(!prod) throw new notFound("Product doesn't exist in database")
            let prodImage = prod.image
            let key = prodImage.slice(prodImage.lastIndexOf('/')+1)
            let command = new DeleteObjectCommand({
                Bucket: "sustainability-market-images",
                Key: key
            })
            await client.send(command)
            key = `${req.file.originalname}-${Date.now()}`
            command = new PutObjectCommand({
                Body: buffer,
                Bucket: "sustainability-market-images",
                Key: key,
                ContentType: req.file.mimetype
            })
            prodImage = `https://sustainability-market-images.s3.us-east-1.amazonaws.com/${key}`
            product = await model.findOneAndUpdate({vendor:UserId,_id:id},{...req.body,image:prodImage},{returnDocument:"after",runValidators:true})
            
    
    }
    
    
    else{
        product = await model.findOneAndUpdate({vendor:UserId,_id:id},req.body,{runValidators:true,returnDocument:"after"})
    }
    if(!product) throw new notFound("Product doesn't exist in database")
        res.status(StatusCodes.OK).json({success:true,product,message:`Product updated successfully`})
    }


const getProductsAdmin = async (req,res)=>{
    let {status,page,count} = req.query
    if(!page) page = 1
    if(!count) count  = 5
    let amount = (page-1)*count
    const products = await model.find({status}).skip(amount).limit(count)
    res.status(StatusCodes.OK).json({success:true, products,message:"Products fetched successfully",noHits:products.length})
    
}

const getProductAdmin = async (req,res)=>{
    const {productId} = req.params
    const product = await model.findOne({_id:productId})
    if(!product) throw new notFound("Product doesn't exist")
        res.status(StatusCodes.OK).json({success:true,product,message:"Product fetched successfully"})
}

const verifyProduct = async (req,res)=>{
    const {productId} = req.params
    const {status} = req.body
    const product = await model.findOneAndUpdate({_id:productId},{status},{returnDocument:"after",runValidators:true})
    if(status==="verified") res.status(StatusCodes.OK).json({success:true,product,message:"Product verified successfully"})
    else{
        res.status(StatusCodes.OK).json({success:true,product,message:"Product rejected successfully"})
    }
}

module.exports = {createProduct,getProducts,
                deleteProduct,getProduct,
                updateProduct,getProductsAdmin,verifyProduct,getProductAdmin}