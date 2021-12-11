const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController')
//rutas para vistas
router.get('/',authController.isAutenticated, (req, res) => {
    res.render('index',{user:req.user});
})
router.get('/login', (req, res) => {
    res.render('login',{alert:false});
})
router.get('/registro', (req, res) => {
    res.render('registro',{alert:false});
})

//rutas del controldor
router.post('/registro', authController.registrar)
router.post('/login', authController.login)
router.get('/logout',authController.logOut)
module.exports = router;