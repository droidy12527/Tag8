const mongoose =  require('mongoose')

const user_login = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 6, 
        max: 200
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 200
    },
    password:{
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('user', user_login)
