const fs = require('fs')
const path = require('path')
const praths = require('../models/save_file')
const usermodel = require('../models/mongo_db')
const numberplatemodel = require('../models/user_model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
//USING ASYNC FOR FUNTIONS AND SIMPLICITY


exports.rootfile = (req, res, next) =>{
    // console.log(req.session.Loggedin)
    if(req.session.LoggedIn){
        res.render('index', {
            api_key:"",
            set_content: req.session.set_content,
            file_set: req.session.file_set,
            username: req.session.username,
            LoggedIn: req.session.LoggedIn
        })
    }
    res.render('login')
}


exports.create_acc = (req,res)=>{
    res.render('buskachoo')
}

//CREATE_ACCOUNT POST
exports.account = async (req, res) =>{
    // console.log(req.body)
    //Find Existing Email
    const email_exist = await usermodel.findOne({email: req.body.email})
    if(email_exist){
       return res.status(400).send('Email Already Exist')
    }
    //Salting and Hashing the User password.
    const salt = await bcrypt.genSalt(10)

    //Check the user_email Matches
    if (req.body.password == req.body.password_confirmation){
    //Hash the password before sending it 
    const hashed_password = await bcrypt.hash(req.body.password, salt)    
    const user = new usermodel({
        username:req.body.username,
        email: req.body.email,
        password: hashed_password
    })
    try {
        const hello = await user.save()
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
}else{
    //Send back to the signup page.
    res.send('Both The password did not match')
}

}

exports.submission = async (req,res)=>{
    // console.log(req.body)
    const user = await usermodel.findOne({email: req.body.email})
    req.session.set_content = false
    if(user){
        const damn = await bcrypt.compare(req.body.password, user.password)
        if(damn){
            //Set cookie and session for the user authentication
            req.session.LoggedIn = true
            req.session.username = user.username
            req.session.file_set = false
            req.session.main_id = user._id
            //send user to the mainpage and ask for api token
            //Directly redirecting without any authentication on route must be added.
            res.render('index', {
                api_key:"",
                set_content: req.session.set_content,
                file_set: req.session.file_set,
                username: req.session.username,
                LoggedIn: req.session.LoggedIn
            })
        }
        else{
            //Send user back with response
            return res.send('Check your password')
        }
    }else{
        return res.send('Email or password Is wrong')
    }
}


//This is shitty function
exports.retrive = (req, res) =>{
    praths.fetch((values)=>{ 
        res.json(values)
    })
}

//LOGOUT PAGE

exports.getlogout = (req,res) =>{
    req.session.destroy((err=>{
        // console.log(err)
        res.redirect('/')
    }))
}

//The route defined for Getting number.


exports.postshow_content = (req, res)=>{
    const json_path = path.join(__dirname,'..','output.json')
    req.session.set_content = true
    try {
        if (fs.existsSync(json_path)) {
            console.log('It is there')
            fs.readFile(json_path, (err, data)=>{
                if(err) throw err
                let prath = JSON.parse(data)
                res.render('index', {
                    api_key:"",
                    set_content: req.session.set_content,
                    username: req.session.username,
                    file_set: req.session.file_set,
                    isauth: req.session.LoggedIn,
                    date: prath.date_created,
                    number: prath.number
                })
            })
        }
      } catch(err) {
        console.error(err)
      }
}

//File Uploader

exports.file_upload = async (req, res) =>{
    const file = req.file
    console.log(file)
    req.session.file_set = true
    const dir_name = path.join(__dirname, '..', 'file_modifier', 'file')
    fs.writeFile(dir_name, 'Hello', (err)=>{
        if (err) throw err
        console.log('created')
    })
    res.render('index',{
        api_key:"",
        set_content:req.session.set_content,
        username: req.session.username,
        file_set: req.session.file_set
    })
}

exports.unset_image = (req, res)=>{
    req.session.file_set = false
    req.session.set_content = false
    res.render('index',{
        api_key:"",
        set_content:req.session.set_content,
        username: req.session.username,
        file_set: req.session.file_set
    })
}

exports.get_api_key =(req, res)=>{
    const token = jwt.sign({ _id: req.session.main_id }, process.env.TOKEN_SECRET)
    res.render('index',{
        api_key:token,
        set_content:false,
        username: req.session.username,
        file_set: req.session.file_set
    })
}
