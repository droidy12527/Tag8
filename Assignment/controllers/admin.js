const mongoose = require('mongoose')
const modelmongoose = require('../model/basicmodel')

exports.mainpage = (req, res, next)=>{
    res.render('index')
}

exports.submitdata = async (req, res, next)=>{
    // console.log(req.body)
    const user_model = new modelmongoose({
        name: req.body.name,
        phonenumber: req.body.phoneno,
        address: req.body.address,
        email: req.body.email
    })
    try {
        const saveduser = await user_model.save()
        return res.send(saveduser)
    } catch (error) {
        throw error
    }
}