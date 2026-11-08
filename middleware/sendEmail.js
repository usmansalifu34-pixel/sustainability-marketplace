const nodemailer = require('nodemailer')
const transporter =  nodemailer.createTransport({
    host: process.env.mailHost,
    port: process.env.mailPort,
    auth: {
        user: process.env.mailName,
        pass: process.env.mailPassword
    }

})
const sendMail  = async (mail,code)=>{
    const mailOptions = {
    from: "Zephyr",
    to: `${mail}`,
    subject: "Student email verification",
    text: `Your verification code is ${code}`
    }
    try{
    const res = await nodemailer.sendMail(mailOptions)
    const message = nodemailer.getTestMessageUrl(res)
    console.log(message)
    }
    catch(err){
        throw err
    }
}
module.exports = sendMail