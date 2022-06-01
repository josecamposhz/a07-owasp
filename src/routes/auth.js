const { Router } = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const { totp } = require('otplib');
const rateLimit = require('express-rate-limit');
const requiresAuth = require('../middlewares/requiresAuth');
const commonPasswords = require("../../password-list.json");
const { sendVerificationEmail } = require('../services/email');
const db = require('../db/users');

totp.options = { step: 90, algorithm: 'sha256' };

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios"
      });
    }

    const invalidPassword = testPassword(password);
    if (invalidPassword) {
      return res.status(400).json({
        error: invalidPassword.message
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser({ email, password: hashPassword });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).send({ error });
  }
});


const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 100 requests per `window` (here, per 1 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Has superado el límite de solicitudes, vuelve a intentarlo en unos minutos"
});
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const { failed_logins, ...user } = await db.getUserByEmail(email);

    if (failed_logins >= 3) {
      const block_time = failed_logins * 30 * 1000; // 30 seconds per failed login
      const validLoginDate = new Date(user.last_failed_login).getTime() + block_time;
      if (validLoginDate > Date.now()) {
        return res.status(401).json({
          error: "Has superado el límite de solicitudes, vuelve a intentarlo en unos minutos"
        });
      }
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await db.updateFailedLogin(email);
      return res.status(400).json({ error: "Credenciales inválidas" });
    };

    const secret = uuidv4();
    await db.updateUserSecret({ email, secret });

    let token = totp.generate(secret);
    sendVerificationEmail({ email, token });

    res.status(200).json({ message: 'Revisa tú correo electronico.', timeRemaining: totp.timeRemaining() });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.post('/verify', async (req, res) => {
  const { email, token } = req.body;
  const user = await db.getUserByEmail(email);
  const secret = user.totp_secret;
  const isValid = totp.verify({ token, secret });
  if (isValid) {
    const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: 60 * 60 * 24 });
    return res.status(200).json({ token });
  }
  res.status(400).json({ error: 'Verificación fallida' });
});

router.get('/user', requiresAuth, (req, res) => {
  res.status(200).send(req.user);
});


const testPassword = (password) => {
  // Check password length is at least 8 characters
  if (password.length < 8) {
    return { message: "La contraseña debe tener al menos 8 caracteres de largo" };
  }

  // Check if password is in the most common password list
  if (commonPasswords.includes(password)) {
    return { message: "Selecciona una contraseña más segura" };
  }

  // can't include the same character 3 or more consecutive characters
  const regex = /(.)\1\1/;
  if (regex.test(password)) {
    return { message: "La contraseña no puede contener 3 o más caracteres consecutivos" };
  }

  return null;
};

module.exports = router;