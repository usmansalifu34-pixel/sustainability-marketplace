const express = require('express')
const app = express()
require('dotenv').config()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const connectDB = require('./database/connectDB')
const authRouter = require('./routes/authRoutes')
const errorHandler = require('./middleware/errorHandlerMid')

app.use('/market/v1/auth',authRouter)
const port = process.env.port || 3000

const start = async()=>{
    try {
        await connectDB(process.env.mongo_uri)
        console.log(`Database connected successfully`)
        app.listen(3000,()=>{console.log(`Server is listening on port ${port}`)})
        app.use(errorHandler)
    } catch (error) {
        console.error(`Unable to connect to database`)
    }
    
}

start()