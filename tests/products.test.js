const req = require('supertest')
const {app} = require('../app')
const mongoose = require('mongoose')

describe('Tests all product routes',()=>{
    let token;
    let productId = '6aca3c03e398e6278b5d7c2a'
    let fakeId = '64b7f0c2a1d3e4f5a6b7c8d9'
    let wrongId = '64b7f0c2a1d3e4f5a6b7c8dz'
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
           
            let res = await req(app).get(`/market/v1/products/${productId}`).set('Authorization',`Bearer ${token}`)
            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
        })
        test('Fails if the product doesn\'t exist',async ()=>{
            let res = await req(app).get(`/market/v1/products/${fakeId}`).set('Authorization',`Bearer ${token}`)
            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
        })
        test('Fails if an invalid id is passed into the request params',async ()=>{
            let res = await req(app).get(`/market/v1/products/${wrongId}`).set('Authorization',`Bearer ${token}`)
            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
        })
    })
    describe('Tests Updating of a product',()=>{
        test('Should successfully update a vendor\s product',async ()=>{
                let res = await req(app).patch(`/market/v1/products/${productId}`).set('Authorization',`Bearer ${token}`).send({'name':'Yellow Chamomile'})
                console.log(res.text,productId)
                expect(res.statusCode).toBe(200)
                expect(res.body.success).toBe(true)
        })
    })
    afterAll(async () => {
  await mongoose.connection.close()
})
})