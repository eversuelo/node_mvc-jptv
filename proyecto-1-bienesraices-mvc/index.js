import express from 'express';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import db from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
//Crear la App
const app= express();
//Habilitas lectura de datos
app.use(express.urlencoded({extended:true}));

//Habilitar cookie parser
app.use(cookieParser());
//Habilitar CSRF
app.use(csurf({cookie:true}));
//Conectar la BD
try{
    await db.authenticate();
    db.sync();
    console.log('Base de datos conectada');
}catch(error){
    console.log(error);
}
//Hanilitar Pug
app.set('view engine','pug');
app.set('views','./views');
//Carpeta Publica 
app.use(express.static('public'));
app.use('/auth',usuarioRoutes);


//Definir un puerto y arrancar el rpoyecto
const port =3000;
app.listen(port,()=>{
    console.log("Estamos Ejecutando el servidor en el puerto "+port);
});