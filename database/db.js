//modulo donde haremos la conexion

const mysql = require('mysql');

const cn = mysql.createConnection({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,

});

cn.connect((err)=>{
    if(err){
        console.log("Error de conexion: "+ err)
        return
    }
    console.log('base de datos conectada correctamente.')
})

module.exports = cn;