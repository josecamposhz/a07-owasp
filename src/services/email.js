const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

const sendVerificationEmail = function ({ email, token }) {
    let html = `
        
        <h2>¿Iniciaste sesión desde un nuevo dispositivo o ubicación?</h2
        <p>Recientemente intentaste iniciar sesión en tu cuenta de Binance desde un nuevo dispositivo o ubicación.
        Revise el intento de inicio de sesión para confirmar que fue usted.</p>
        <p><strong>Fui yo</strong></p>
        <p>Si reconoce esta actividad, autorice su dispositivo utilizando el siguiente código de activación:</p>
        <h3>${token}</h3>
        <p><strong>No fui yo</strong></p>
        <p> Restablece tú contraseña.</p>
        `
        ;

    let mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: 'Nuevo Inicio de Sesión',
        html,
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            throw err;
        }
    });
};

module.exports = { sendVerificationEmail };