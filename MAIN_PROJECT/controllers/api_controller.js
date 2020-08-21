const usermodel = require('../models/mongo_db')
const numberplatemodel = require('../models/user_model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const fs_prommise = require('fs').promises

exports.get_users = (req, res)=>{
    usermodel.find({},(err,result)=>{
        res.json(result)
    })
}

exports.get_main = (req, res)=>{
   res.json({
       status:"Api is alive"
   })
}

exports.account = async (req, res) =>{
    // console.log(req.body)
    const email_exist = await usermodel.findOne({email: req.body.email})
    if(email_exist){
       return res.status(400).json({
           error_status: "Mail already exist"
       })
    }
    const salt = await bcrypt.genSalt(10)
    const hashed_password = await bcrypt.hash(req.body.password, salt)    
    const user = new usermodel({
        username:req.body.username,
        email: req.body.email,
        password: hashed_password
    })
    try {
        const hello = await user.save()
        res.json({
            status: "Account Created Sucessfully"
        })
    } catch (error) {
        console.log(error)
    }
}

exports.delete_user = (req, res)=>{
    const id = req.body.id
    usermodel.deleteOne({ _id: id}, (err)=>{
        if(err) res.json({status:"There was an error while deleting"})
        res.json({
            status:"Account deleted sucessfully"
        })
    })
}

exports.get_user_info = (req, res)=>{
    const user_id = req.params.userid
    usermodel.findOne({ _id: user_id}, (err, result)=>{
        if(err) return res.status(404).json({status:"User not found"})
        res.json(result)
    })
}


exports.post_image = (req, res) =>{
    if(!req.file) return res.status(400).json({
        status:"There was an error",
        clue:"Please check the file upload params, file was not found"
    })
    const dir_name = path.join(__dirname, '..', 'file_modifier', 'file')
    fs.writeFile(dir_name, 'Hello', (err)=>{
        if (err) throw err
        console.log('created')
    })
    res.status(200).json({
        status:"The file was uploaded sucessfuly"
    })
}

exports.user_token = async (req, res)=>{
    const user = await usermodel.findOne({email: req.body.email})
    if(user){
        const damn = await bcrypt.compare(req.body.password, user.password)
        if(damn){
            const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
            res.header('auth-token', token).json({
              Secret_Access_Token: token
            })
        }
        else{
            return res.json({
                status:"Are you sure you are registered?"
            })
        }
    }else{
        return res.json({
            status: "Email or password is wrong"
        })
    }
}

exports.get_number = (req,res)=>{
    const json_path = path.join(__dirname,'..','prathamesh_deep_learning_2020-07-21.json')
    try {
        if (fs.existsSync(json_path)) {
            fs.readFile(json_path, (err, data)=>{
                if(err) throw err
                let prath = JSON.parse(data)
                res.json(prath)
            })
        }
      } catch(err) {
        console.error(err)
      }

}

exports.create_numberinfo = async (req, res)=>{
    const bumbaa = await numberplatemodel.findOne({numberplate: req.body.number})
    if(bumbaa) return res.json({status: "The numberplate Exists"})
    const number_insert = req.body.number
    const numberinfo = new numberplatemodel({
        firstname:req.body.firstname,
        lastname: req.body.lastname,
        numberplate: number_insert.toUpperCase(),
        registration_number: req.body.registration_number
    })
    try {
        const hello = await numberinfo.save()
        res.json({
            status: "Numberplate Created Sucessfully"
        })
    } catch (error) {
        console.log(error)
    }
}


exports.check_info = async (req, res)=>{
    let numberplateinfo = ""
    const json_path = path.join(__dirname,'..','output.json')
    try {
        if(fs.existsSync(json_path)) {
            const data = await fs_prommise.readFile(json_path)
            const stringed = JSON.parse(data)
            numberplateinfo = stringed.number
        }
      } catch(err) {
        console.error(err)
      }
      const info = await numberplatemodel.findOne({numberplate: numberplateinfo})
      res.json({
          status:"FOUND",
          firstname: info.firstname,
          lastname: info.lastname,
          numberplate_matched: info.numberplate,
          registration: info.registration_number
      })
}