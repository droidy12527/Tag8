const express = require('express')
const parser = require('body-parser')
const routes = require('../controllers/admin')

const router = express.Router()


router.get('/', routes.mainpage)
router.post('/submit', routes.submitdata)

module.exports = router