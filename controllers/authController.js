const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cn = require('../database/db');
const { promisify } = require('util');
const { nextTick } = require('process');
const { token } = require('morgan');

//estos metodos tienen que registrarse en el enrutador
//metodo registro
exports.registrar = async (req, res) => {
    const { name, user, pass } = req.body;

    if (!name || !user || !pass) {
        res.render('registro', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Por favor no dejes campos vacíos.",
            alertIcon: 'info',
            showConfirmButton: true,
            timer: false,
            ruta: 'registro'
        });
    } else {
        try {
            const salt = await bcrypt.genSalt(10);//generamos un salt que posteriormente pasamos al metodo de bcrypt 
            let hasspass = await bcrypt.hash(pass, salt);
            cn.query("Insert into users set ? ", { user: user, name: name, pass: hasspass }, (error, results) => {
                if (error) {
                    console.log(error)
                    return
                }
                res.redirect('/');
            });
        } catch (error) {
            console.error(error)
        }
            
    }

}

exports.login = async (req, res) => {
    try {
        const { user, pass } = req.body;

        if (!user || !pass) {
            res.render('login', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Por favor no dejes campos vacíos",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });

        } else {
            cn.query("Select * from users where user= ?", [user], async (error, results) => {
                if (results.lenght == 0 || !(await bcrypt.compare(pass, results[0].pass))) {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o Password inválidos",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                } else {
                    //iniciamos sesion
                    const { id } = results[0];
                  
                    const token = jwt.sign({ id: id }, process.env.JWTKEY, {
                        expiresIn: process.env.JWT_EXPIRA
                    });
                    const cookies = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookies);
                    res.render('login', {
                        alert: true,
                        alertTitle: "¡Exito!",
                        alertMessage: "Inicio de sesión exitoso",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                    });
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}
//este metodoo se usa en todas las rutas en donde queramos verificar la autenticacion del usuario
exports.isAutenticated = async (req, res,next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWTKEY)
    
            cn.query("Select * from users where id =?",[decodificada.id],(err,result)=>{
                if(!result){return next()}
                req.user = result[0];
                return next();
            });
        } catch (error) {
            console.log(error);
            return next();
        }
            next();
    }else{
        console.log("hacia el login")
      return  res.redirect('/login');
    }
}

exports.logOut = async (req,res) =>{
    try {
            res.clearCookie('jwt');
            return res.redirect('/login');
    } catch (error) {
        
    }
}