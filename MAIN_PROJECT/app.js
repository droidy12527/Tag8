const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const damn = require('./controllers/error')
const mongoose = require('mongoose')
const session = require('express-session')
const multer = require('multer')
const MongoSession = require('connect-mongodb-session')(session)
require('dotenv').config()

const app = express()
const mongo_session = MongoSession({
    uri: process.env.MONGOOSE_KEY,
    collection: 'sessions'
})


const FileStorage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'images')
    },
    filename:(req, file, cb)=>{
        cb(null, 'numberplate_image.png')
    }
})

const file_filter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    }
    cb(null, false)
}


app.use(morgan('common'))
app.use(helmet())
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect(process.env.MONGOOSE_KEY,{ useNewUrlParser: true }, ()=>{
    console.log('Connected to db sucessfully')
})


app.use(multer({storage: FileStorage, fileFilter: file_filter}).single('image'))
const adminRoutes = require('./routes/admin')
const api_routes = require('./routes/api')

app.use(session({secret:'MajidPrathameshHarshal', resave:false, saveUninitialized:false , store: mongo_session}))

app.use(adminRoutes)

//Setting the cors headers
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow_Methods','GET, POST')
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization')
    next()
})



app.use('/api', api_routes)

app.use(damn.error)

app.listen(8080,()=>{
    console.log("Started Server At Port 8080")
})