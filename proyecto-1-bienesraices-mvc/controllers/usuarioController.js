import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generarId,generarJWT } from "../helpers/tokens.js";
import { emailRegister, emailForgotPassword } from "../helpers/email.js";
const formLogin = (req, res) => {
    res.render('auth/login', {
        page: "Iniciar Sesion",
        csrfToken: req.csrfToken()
    });
}
const formRegister = (req, res) => {
    res.render('auth/registro', {
        page: "Crear Cuenta",
        csrfToken: req.csrfToken()
    });
}
const autenticar = async (req, res) => {
    //Validacion de datos
    await check('email').notEmpty().isEmail().withMessage('El email no es correcto.').run(req);
    await check('password').notEmpty().withMessage('El password no puede ir vacio').run(req);
    let resultado = validationResult(req);
    //Verificar si hay errores
    if (!resultado.isEmpty()) {
        return res.render('auth/login', {
            page: "Iniciar Sesion",
            errores: resultado.array(),
            user: {
                email: req.body.email,
            },
            csrfToken: req.csrfToken()
        });
    }
    //Verificar si el usuario ya esta registrado
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
        return res.render('auth/login', {
            page: "Iniciar Sesion",
            errores: [{ msg: 'El usuario no existe' }],
            user: {
                email: req.body.email,
            },
            csrfToken: req.csrfToken()
        });
    }
    //Comprobar si el usuario esta confirmado
    if (!usuario.confirm) {
        return res.render('auth/login', {
            page: "Iniciar Sesion",
            errores: [{ msg: 'Confirma tu cuenta' }],
            user: {
                email: req.body.email,
            },
            csrfToken: req.csrfToken()
        });
    }

    //Verificar si el password es correcto
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            page: "Iniciar Sesion",
            errores: [{ msg: 'El password es incorrecto' }],
            user: {
                email: req.body.email,
            },
            csrfToken: req.csrfToken()
        });
    }
    
    //Autenticar al usuario
    const token = generarJWT(usuario.id);
    console.log(token);

}
const register = async (req, res) => {
    //Validacion de datos
    await check('name').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('email').notEmpty().isEmail().withMessage('El email no es correcto.').run(req);
    await check('password').isLength({ min: 6 }).notEmpty().withMessage('El password no puede ir vacio').run(req);
    await check('password_confirm').equals(req.body.password).withMessage('Los Password no son iguales').run(req);
    let resultado = validationResult(req);
    //Verificar si hay errores
    if (!resultado.isEmpty()) {
        return res.render('auth/registro', {
            page: "Crear Cuenta",
            errores: resultado.array(),
            user: {
                name: req.body.name,
                email: req.body.email,
            },
            csrfToken: req.csrfToken()
        });
    }

    const { name, email, password } = req.body;
    //Verificar si el usuario ya esta registrado
    const existeUsuario = await Usuario.findOne({ where: { email: email } });
    if (existeUsuario) {
        return res.render('auth/registro', {
            page: "Crear Cuenta",
            errores: [{ msg: 'El usuario ya esta registrado' }],
            user: {
                name: name,
                email: req.body.email,
            },
            csrfToken: req.csrfToken()
        });
    }

    //Crear usuario
    const usuario = await Usuario.create({
        name: name,
        email: email,
        password: password,
        token: generarId(),
    });
    emailRegister({
        name: usuario.name,
        email: usuario.email,
        token: usuario.token,
    });
    //Mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        page: "Cuenta Creada Correctamente",
        message: "Se ha enviado un correo electronico a tu cuenta para confirmar tu registro"
    });

}
//Funcion que comprueba una cuenta
const formForgotPassword = (req, res) => {
    res.render('auth/forgot-password', {
        page: "Recuperar Contraseña",
        csrfToken: req.csrfToken()
    });
}
const confirm = async (req, res) => {

    const token = req.params.token;

    //Verificar si el usuario existe
    const usuario = await Usuario.findOne({ where: { token: token } });
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            page: "Error",
            error: true,
            message: "El token no tiene relación con ningún usuario registrado"
        });
    }
    //Confirmar la cuenta
    usuario.token = null;
    usuario.confirm = true;
    usuario.save();
    console.log(usuario);
    res.render('auth/confirmar-cuenta', {
        page: "Confirmar Cuenta",
        message: "Cuenta confirmada correctamente"

    });
}
const resetPassword = async (req, res) => {
    //Validacion de datos
    await check('email').notEmpty().isEmail().withMessage('El email no es correcto.').run(req);
    let resultado = validationResult(req);
    //Verificar si hay errores
    if (!resultado.isEmpty()) {
        return res.render('auth/forgot-password', {
            page: "Recuperar Contraseña",
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }
    //Buscar el usuario
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email: email } });
    if (!usuario) {
        return res.render('auth/forgot-password', {
            page: "Recuperar Contraseña",
            errores: [{ msg: 'El usuario no existe' }],
            csrfToken: req.csrfToken()
        });
    }
    //Generar un token
    usuario.token = generarId();
    await usuario.save();
    //Enviar el correo
    emailForgotPassword({
        name: usuario.name,
        email: usuario.email,
        token: usuario.token
    });
    res.render('templates/mensaje', {
        page: "Recuperar Contraseña",
        message: "Se ha enviado un correo electronico a tu cuenta para recuperar tu contraseña"
    });
}
const compareToken = async (req, res) => {
    const token = req.params.token;
    const usuario = await Usuario.findOne({ where: { token: token } });
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            page: "Recuperar Contraseña",
            error: true,
            message: "Hubo un error al recuperar la contraseña"
        });
    }
    //Mostrar el formulario para generar el nuevo password
    res.render('auth/reset-password', {
        page: "Recuperar Contraseña",
        csrfToken: req.csrfToken(),
        token: token
    });

}

const newPassword = async (req, res) => {
    //Validar el password
    await check('password').isLength({ min: 6 }).notEmpty().withMessage('El password no puede ir vacio').run(req);
    await check('password_confirm').equals(req.body.password).withMessage('Los Password no son iguales').run(req);
    let resultado = validationResult(req);
    //Verificar si hay errores
    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            page: "Recuperar Contraseña",
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            token: req.params.token
        });
    }
    //Verificar el token valido y el usuario
    const usuario = await Usuario.findOne({ where: { token: req.params.token } });
    if (!usuario) {
        return res.render('auth/reset-password', {
            page: "Recuperar Contraseña",
            error: true,
            message: "Hubo un error al recuperar la contraseña"
        });
    }
    //Guardar el nuevo password
    usuario.password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(usuario.password, salt);
    usuario.token = null;
    usuario.confirm = true;
    await usuario.save();
    //Redirigir
    res.render('templates/mensaje', {
        page: "Recuperar Contraseña",
        message: "Contraseña modificada correctamente"
    });

}
export {
    formLogin, formRegister, formForgotPassword, register, confirm, resetPassword, compareToken, newPassword, autenticar
}