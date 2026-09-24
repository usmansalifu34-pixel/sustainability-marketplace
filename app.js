const express = require('express')
const app = express()
require('dotenv').config()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const connectDB = require('./database/connectDB')
const authRouter = require('./routes/authRoutes')
const prodRouter = require('./routes/productsRoutes')
const cartRouter = require('./routes/cartRouter')
const vendorRouter = require('./routes/vendorRoute')

const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')


const authMid = require('./middleware/authMid')
const errorHandler = require('./middleware/errorHandlerMid')
const notFound = require('./middleware/notFoundMid')

app.set('trust proxy', 1)
app.use(rateLimit({
    windowMs: 15*60*1000,
    limit:100
}))
app.use(cors())
app.use(morgan('dev'))
app.use(helmet())
app.use('/market/v1/auth',authRouter)
app.use('/market/v1/products',authMid,prodRouter)
app.use('/market/v1/cart',authMid,cartRouter)
app.use('/market/v1/vendor')
const port = process.env.port || 3000






const start = async()=>{
    try {
        await connectDB(process.env.mongo_uri)
        console.log(`Database connected successfully`)
        app.listen(3000,()=>{console.log(`Server is listening on port ${port}`)})
        app.use(errorHandler)
        app.use(notFound)
    } catch (error) {
        console.error(`Unable to connect to database`)
    }
    
}

start()