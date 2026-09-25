const bcrypt = require('bcryptjs')

const genPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    console.log(hashedPassword)
}
genPassword("randompassword")