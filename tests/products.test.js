const req = require('supertest')
const {app} = require('../app')
const mongoose = require('mongoose')

describe('Tests all product routes',()=>{
    let authToken;
    let unAuthToken;
    let customerToken;
    let productId = '6aca3c03e398e6278b5d7c2a'
    let fakeId = '64b7f0c2a1d3e4f5a6b7c8d9'
    let wrongId = '64b7f0c2a1d3e4f5a6b7c8dz'
    beforeAll(async ()=>{
        await mongoose.connect(process.env.mongo_uri)
        let res = await req(app).post('/market/v1/auth/login').send({email:"josh@gmail.com",password:"password"})
        authToken = res.body.token
        res = await req(app).post('/market/v1/auth/login').send({email: "randy@gmail.com",password:"password"})
        unAuthToken = res.body.token
        res = await req(app).post('/market/v1/auth/login').send({email: "salifu@gmail.com",password:"password"})
        customerToken = res.body.token
    })
    describe('Tests all get product routes (get all and get one)',()=>{
        
        test('Get all products',async ()=>{
            let res = await req(app).get('/market/v1/products').set('Authorization',`Bearer ${authToken}`)
            expect(res.statusCode).toBe(200)
            expect(Array.isArray(res.body.products)).toBe(true)
    
        })
        test('successfully get an existing product by id',async()=>{
           
            let res = await req(app).get(`/market/v1/products/${productId}`).set('Authorization',`Bearer ${authToken}`)
            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
        })
        test('Fails if the product doesn\'t exist',async ()=>{
            let res = await req(app).get(`/market/v1/products/${fakeId}`).set('Authorization',`Bearer ${authToken}`)
            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
        })
        test('Fails if an invalid id is passed into the request params',async ()=>{
            let res = await req(app).get(`/market/v1/products/${wrongId}`).set('Authorization',`Bearer ${authToken}`)
            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
        })
    })
    describe('Tests Updating of a product',()=>{
        test('successfully update\'s a vendor\s product',async ()=>{
                let res = await req(app).patch(`/market/v1/products/${productId}`).set('Authorization',`Bearer ${authToken}`).send({'name':'Yellow Chamomile'})
                console.log(res.text,productId)
                expect(res.statusCode).toBe(200)
                expect(res.body.success).toBe(true)
        })
        test('Should fail if the product wasn\'t made by the person trying to update it',async()=>{
            let res = await req(app).patch(`/market/v1/products/${productId}`).set('Authorization',`Bearer ${unAuthToken}`).send({'name':'Yellow daisies'})
            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
        })
        test('Should block non-vendors from accessing the route', async ()=>{
            let res = await req(app).patch(`/market/v1/products/${productId}`).set('Authorization',`Bearer ${customerToken}`).send({'name':'Yellow Chamomile'})
            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
        })
    })
    afterAll(async () => {
  await mongoose.connection.close()
})
})