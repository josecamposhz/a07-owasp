const { Router } = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require('../db/users');

const router = Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await db.createInsecureUser({ email, password: hashPassword });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await await db.getInsecureUserByEmail(email);

        // verificamos que el usuario está en la bd
        if (!user) {
            return res.status(404).send({
                error: "Este usuario no está registrado en la base de datos",
                code: 404,
            });
        }

        // verificamos que la contraseña ingresada es correcta
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        };

        // retornamos el token de autenticación
        const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: 60 * 60 * 24 });
        res.send({ token });
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router;