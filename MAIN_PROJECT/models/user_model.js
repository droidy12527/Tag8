const mongoose = require('mongoose')

const numberplateinfo = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        max: 200
    },
    lastname: {
        type: String,
        required: true,
        max: 200
    },
    numberplate:{
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    registration_number:{
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

module.exports = mongoose.model('numberplateinfo', numberplateinfo)