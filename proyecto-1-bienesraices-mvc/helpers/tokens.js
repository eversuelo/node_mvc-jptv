import jwt from 'jsonwebtoken';
const generarJWT=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'1d'});
const generarId=()=>Math.random().toString(32).substr(2)+Date.now().toString(32);
export {generarId,generarJWT};