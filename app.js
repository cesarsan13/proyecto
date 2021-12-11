const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express();

app.set('port', process.env.PORT || 4000);


//motor de pplantllas
app.set('view engine', 'ejs');

//archivos publicos
app.use(express.static('public'))
//midlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//cariables de entorno
dotenv.config({ path: './env/.env' });

app.use(cookieParser());

app.use(require('./routes/router'));

app.use('/',(req, res, next) => {
    console.log(req.user)
    if (req.user==undefined)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.listen(app.get('port'), () => {
    console.log("servidor en puerto ", app.get('port'));
})