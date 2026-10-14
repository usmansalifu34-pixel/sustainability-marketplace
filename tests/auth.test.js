const requests = require('supertest')
const {app} = require('../app')

describe('Auth route tests',()=>{
    let token;
    // beforeAll( ()=>{
        
    // })
    test('it logs a user in',async ()=>{
            let res = await requests(app).post('/market/v1/auth/login').send({email:'josh@gmail.com',password:'password'})
            expect(res.statusCode).toBe(200)
            //expect(res).toBe(true)
        })
})