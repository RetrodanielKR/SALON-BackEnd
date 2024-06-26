const execQuery = require('./../helpers/execQuery');
const { TYPES } = require('tedious');
const bcrypt = require('bcrypt');

const addUser = async (userData) => {
    const { userID, nombre, contraseña, correo, telefono } = userData;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const query = `
        INSERT INTO [dbo].[usuario] (UserID, Nombre, contraseña, correo, telefono)
        VALUES (@userID, @nombre, @contraseña, @correo, @telefono)
    `;
    const parameters = [
        { name: 'userID', type: TYPES.UniqueIdentifier, value: userID },
        { name: 'nombre', type: TYPES.VarChar, value: nombre },
        { name: 'contraseña', type: TYPES.VarChar, value: hashedPassword },
        { name: 'correo', type: TYPES.VarChar, value: correo },
        { name: 'telefono', type: TYPES.VarChar, value: telefono },
    ];
    console.log("Executing addUser query:", query);  // Mensaje de depuración
    return execQuery.execWriteCommand(query, parameters);
};

const updateUser = async (userData) => {
    const { userID, nombre, contraseña, correo, telefono } = userData;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const query = `
        UPDATE [dbo].[usuario]
        SET Nombre = @nombre, contraseña = @contraseña, correo = @correo, telefono = @telefono
        WHERE UserID = @userID
    `;
    const parameters = [
        { name: 'userID', type: TYPES.UniqueIdentifier, value: userID },
        { name: 'nombre', type: TYPES.VarChar, value: nombre },
        { name: 'contraseña', type: TYPES.VarChar, value: hashedPassword },
        { name: 'correo', type: TYPES.VarChar, value: correo },
        { name: 'telefono', type: TYPES.VarChar, value: telefono },
    ];
    console.log("Executing updateUser query:", query);  // Mensaje de depuración
    return execQuery.execWriteCommand(query, parameters);
};

const deleteUser = (userID) => {
    const query = `
        DELETE FROM [dbo].[usuario]
        WHERE UserID = @userID
    `;
    const parameters = [
        { name: 'userID', type: TYPES.UniqueIdentifier, value: userID }
    ];
    console.log("Executing deleteUser query:", query);  // Mensaje de depuración
    return execQuery.execWriteCommand(query, parameters);
};

const allUsers = () => {
    const query = `
        SELECT * FROM [dbo].[usuario]
    `;
    console.log("Executing allUsers query:", query);  // Mensaje de depuración
    return execQuery.execReadCommand(query);
};

const getUserByID = (userID) => {
    const query = `
        SELECT * FROM [dbo].[usuario]
        WHERE UserID = @userID
    `;
    const parameters = [
        { name: 'userID', type: TYPES.UniqueIdentifier, value: userID }
    ];
    console.log("Executing getUserByID query with parameters:", parameters); // Mensaje de depuración
    return execQuery.execReadCommand(query, parameters);
};


const getUserByCorreo = (correo) => {
    const query = `
        SELECT * FROM [dbo].[usuario]
        WHERE correo = @correo
    `;
    const parameters = [
        { name: 'correo', type: TYPES.VarChar, value: correo }
    ];
    return execQuery.execReadCommand(query, parameters);
};

const validateUser = async (correo, contraseña) => {
    const user = await getUserByCorreo(correo);
    if (user.length > 0) {
        const validPassword = await bcrypt.compare(contraseña, user[0].contraseña);
        if (validPassword) {
            return user[0]; // Devuelve todos los datos del usuario
        }
    }
    return null;
};


module.exports = {
    addUser,
    updateUser,
    deleteUser,
    allUsers,
    getUserByID,
    validateUser,
};
