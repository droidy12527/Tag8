const express = require('express')
const parser = require('body-parser')
const prath = require('../controllers/api_controller')
const verify = require('../controllers/private_route') 

const router = express.Router()
const json_parser = express.json()

router.get('/',json_parser, prath.get_main)
router.get('/users',json_parser, verify , prath.get_users)
router.post('/create',json_parser, prath.account)
router.post('/delete', json_parser, verify, prath.delete_user)
router.get('/user/:userid', json_parser, verify, prath.get_user_info)
router.post('/image',verify,prath.post_image)
router.post('/token',json_parser, prath.user_token )
router.get('/number',verify,prath.get_number)
router.post('/create_numberplate', verify, json_parser, prath.create_numberinfo)
router.get('/getdetails',json_parser, prath.check_info)

module.exports = router