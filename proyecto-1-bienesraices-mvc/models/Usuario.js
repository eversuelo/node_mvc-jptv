import { DataTypes } from "sequelize";
import db from "../config/db.js";
import bcrypt from "bcrypt";
const Usuario = db.define('usuarios', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token: DataTypes.STRING,
    confirm: DataTypes.BOOLEAN
}, {
    hooks: {
        beforeCreate: async function (usuario) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
            
        }

    }
});

//Métodos personalizados
Usuario.prototype.verificarPassword = async function (password) {
    return await bcrypt.compareSync(password, this.password);
}
export default Usuario;
