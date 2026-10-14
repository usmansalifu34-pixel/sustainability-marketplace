const req = require('supertest')
const {app} = require('../app')

describe('Auth route tests',()=>{
    let token;
    // beforeAll( ()=>{
        
    // })
    test('it logs a user in',async ()=>{
            let res = await req(app).post('/market/v1/auth/login').send({email:'josh@gmail.com',password:'password'})
            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
        })
    test('fails if a user provides invalid details',async ()=>{
        let res = await req(app).post('/market/v1/auth/login').send({email:"fake@gmail.com",password:"fake"})
        expect(res.statusCode).toBe(400)
        
    })
})