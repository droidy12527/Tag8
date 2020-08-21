const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const parser = require('body-parser')
require('dotenv').config()


const app = express();

//Filestroage properties
const FileStorage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'resume')
    },
    filename:(req, file, cb)=>{
        cb(null, 'studentresume.pdf')
    }
})

//Checking if the file is DOC or PDF
const file_filter = (req, file, cb) =>{
    if(file.mimetype === 'application/pdf' || file.mimetype === 'application/msword'){
        cb(null, true)
    }
    cb(null, false)
}

//Configuring Multer for Incoming Files
app.use(multer({storage: FileStorage, fileFilter: file_filter}).single('resume'))

//Connecting to db
mongoose.connect(process.env.MONGOOSE_KEY,{ useNewUrlParser: true }, ()=>{
    console.log('Connected to db sucessfully')
})

//Setting the EJS view Engine
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.static(path.join(__dirname, 'public')))

const url_parser = parser.urlencoded({extended:false})

const adminRoutes = require('./routes/admin')
app.use(url_parser)
app.use(adminRoutes)

//Errors can be catched here , Routing Errors
app.listen(8080, ()=>{
    console.log("Server Running At port 8080")
})