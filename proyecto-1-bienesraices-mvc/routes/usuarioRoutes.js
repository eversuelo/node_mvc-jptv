import  express, { application }  from "express";
import { formLogin,formRegister,formForgotPassword, register,confirm,resetPassword, compareToken,newPassword,autenticar} from "../controllers/usuarioController.js";
const router=express.Router();
//Routing
router.get('/');
router.get('/login',formLogin);
router.post('/login',autenticar);
router.get('/register',formRegister);
router.post('/register',register);
router.get('/forgot-password',formForgotPassword);
router.post('/forgot-password',resetPassword);
router.get('/nosotros');
router.get('/confirm/:token',confirm)

//Almacena el nuevo password
router.get('/forgot-password/:token',compareToken);
router.post('/forgot-password/:token',newPassword);
export default router;