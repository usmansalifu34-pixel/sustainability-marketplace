const nodeMailer = require('nodemailer')
const transporter = nodeMailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'deanna.balistreri66@ethereal.email',
        pass: 'C5X1UMjv7UKTmkQG8z'
    }
});
const mailOptions = {
    from:'"Zephyr", usmansalifu3@gmail.com',
    to: 'deanna.balistreri66@ethereal.email',
    subject: "Hello from Nodemailer!",
    text: "This is a plain text test email.",
    html: "<b>This is a bold test email!</b>",
}
const sendMail = async()=>{
    try {
         let email = await transporter.sendMail(mailOptions)
         let res = nodeMailer.getTestMessageUrl(email)
         console.log(`Email sent successfully. ${res}`)
    } catch (error) {
        console.log(error.message)
    }
   
}
sendMail()