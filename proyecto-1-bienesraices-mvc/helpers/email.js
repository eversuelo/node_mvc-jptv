import nodemailer from 'nodemailer';
import dotenv from "dotenv";
const emailRegister = async (datos) => {
    var transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });
    const { email, token, name } = datos;
    const url = `http://localhost:3000/confirmar-cuenta/${token}`;
    await transport.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Confirma tu cuenta",
        text: `Hola ${name} Confirma tu cuenta ${url}`,
        html: `
        <p>Hola ${name}, comprueba tu cuenta en bienesRaices.com</p>

        <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: 
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirm/${token}">Confirmar Cuenta</a> </p>

        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
    `
    });
}

const emailForgotPassword = async (datos) => {
    var transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });
    const { email, token, name } = datos;
    const url = `http://localhost:3000/confirmar-cuenta/${token}`;
    await transport.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Restablece y Confirma tu cuenta",
        text: `Hola ${name} Restablece y Confirma tu cuenta ${url}`,
        html: `
        <p>Hola ${name}, comprueba tu cuenta en bienesRaices.com</p>

        <p>Tu cuenta ya esta lista, solo debes Restablecerla y Confirmarla en el siguiente enlace: 
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/forgot-password/${token}">Restablecer Cuenta</a> </p>

        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
    `
    });
}
export { emailRegister,emailForgotPassword}