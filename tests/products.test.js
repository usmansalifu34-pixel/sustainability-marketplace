const req = require('supertest')
const {app} = require('../app')
const mongoose = require('mongoose')

describe('Tests all product routes',()=>{
    let token;
    beforeAll(async ()=>{
        await mongoose.connect(process.env.mongo_uri)
        let res = await req(app).post('/market/v1/auth/login').send({email:"josh@gmail.com",password:"password"})
        token = res.body.token
    })
    describe('Tests all get product routes (get all and get one)',()=>{
        test('Get all products',async ()=>{
            let res = await req(app).get('/market/v1/products').set('Authorization',`Bearer ${token}`)
            expect(res.statusCode).toBe(200)
            expect(Array.isArray(res.body.products)).toBe(true)
    
        })
        test('successfully get an existing product by id',async()=>{
            let productId = '6aca3cbc082ffc78233362ba'
            let res = await req(app).get(`/market/v1/products/${productId}`).set('Authorization',`Bearer ${token}`)
              console.log(res.text)
            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
        })
    })
    afterAll(async () => {
  await mongoose.connection.close()
})
})