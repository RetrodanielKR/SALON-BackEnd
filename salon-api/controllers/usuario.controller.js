const usuariosRoute = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const usuariosModel = require('./../models/usuario.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./../middleware/auth.middleware');  // Importar el middleware

usuariosRoute.get('/', authenticateToken, async (req, res) => {
    usuariosModel.allUsers()
    .then(data => {
        res.status(200).json({ data });
    })
    .catch(error => {
        console.error("Error fetching users:", error);  // Mensaje de depuración
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

usuariosRoute.get('/:id', authenticateToken, async (req, res) => {
    const { id: userID } = req.params;
    usuariosModel.getUserByID(userID)
    .then(data => {
        if (data.length > 0) {
            res.status(200).json({ data: { ...data[0] } });
        } else {
            res.status(404).json({ error: 'No se encuentra este usuario' });
        }
    })
    .catch(error => {
        console.error("Error fetching user by ID:", error);  // Mensaje de depuración
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

usuariosRoute.post('/', async (req, res) => {
    const userID = uuidv4();
    const { nombre, contraseña, correo, telefono } = req.body;
    usuariosModel.addUser({
        userID,
        nombre,
        contraseña,
        correo,
        telefono
    })
    .then((rowCount, more) => {
        res.status(200).json({
            data: {
                rowCount,
                more,
                userID,
            },
        });
    })
    .catch(error => {
        console.error("Error adding user:", error);  // Mensaje de depuración
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

usuariosRoute.put('/:id', authenticateToken, async (req, res) => {
    const { id: userID } = req.params;
    const { nombre, contraseña, correo, telefono } = req.body;
    usuariosModel.updateUser({
        userID,
        nombre,
        contraseña,
        correo,
        telefono
    })
    .then((rowCount, more) => {
        res.status(200).json({
            data: {
                rowCount,
                more,
                userID,
            },
        });
    })
    .catch(error => {
        console.error("Error updating user:", error);  // Mensaje de depuración
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

usuariosRoute.delete('/:id', authenticateToken, async (req, res) => {
    const { id: userID } = req.params;
    usuariosModel.deleteUser(userID)
    .then((rowCount, more) => {
        res.status(200).json({ rowCount, more });
    })
    .catch(error => {
        console.error("Error deleting user:", error);  // Mensaje de depuración
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

usuariosRoute.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;
    try {
        const user = await usuariosModel.validateUser(correo, contraseña);
        if (user) {
            const token = jwt.sign({ userID: user.UserID }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Inicio de sesión exitoso', user });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


usuariosRoute.get('/me', authenticateToken, async (req, res) => {
    try {
        const userID = req.user.userID;
        const user = await usuariosModel.getUserByID(userID);
        if (user.length > 0) {
            res.status(200).json(user[0]);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = usuariosRoute;
