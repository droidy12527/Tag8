const express = require('express')
const prath = require('../controllers/admin_control')
const parser = require('body-parser')

const url_parser = parser.urlencoded({extended: false})
const router = express.Router()

router.get('/', url_parser, prath.rootfile )
router.post('/submit', url_parser, prath.submission)
router.get('/submit', url_parser, prath.rootfile)
router.get('/create_account',url_parser, prath.create_acc)
router.post('/create_account',url_parser, prath.account)
// router.get('/retrive', prath.retrive)
router.get('/logout', url_parser,prath.getlogout)
router.post('/show_content', url_parser, prath.postshow_content)
router.post('/upload_image', url_parser, prath.file_upload)
router.get('/unset_image', url_parser, prath.unset_image)
router.get('/get_key', prath.get_api_key)

module.exports = router