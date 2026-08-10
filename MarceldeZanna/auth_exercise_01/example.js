require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');


const app = express();
const PORT = 3000;

// alle Variablen kommen aus einer ENV Datei und nicht direkt auslesbar
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());

//liesst den Token aus der ENV aus und lässt den Cookie ablaufen
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: 2 * 24 * 60 * 60 * 1000
    }
}));

//selbsterklärende Middleware
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 5, // maximal 5 Versuche in diesem Zeitraum
    message: "Zu viele Loginversuche. Bitte in 15 Minuten erneut versuchen.",
    standardHeaders: true,
    legacyHeaders: false,
});

app.post("/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body //Anfrage von Aussen
        const query = "SELECT password FROM users WHERE username = $1"; //laut Recherche nimmt es aus SQL den ersten Wert
        const { rows } = await pool.query(query, [username]); //holt sich aus der Datenbank die USER

        //wenn kein USER vorhanden ist, return
        if (rows.length === 0) {
            return res.status(401).json({ message: "User existiert nicht!" });
        }

        //holt sich das erste gehashte Passwort aus der QUERY
        const storedHash = rows[0].password;
        //vergleicht das eingegebene Passwort von aussen mit dem gehashten aus der Datenbank (dieses Passwort wird encrypted)
        const matchPw = await bcrypt.compare(password, storedHash);

        //stimmen die Passwörter nicht ein, return
        if (!matchPw) {
            return res.status(401).json({ message: 'Falsches Passwort!' })
        }

        //Stellt den User für andere Stellen bereit, wenn der Login korrekt war
        req.session.user = { username };
        return res.json({ message: "Login erfolgreich!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Login' })
    }
});

app.get("/userdata", async (req, res) => {
    //ist der User nicht eingeloggt, können keine Daten geholt werden
    if (!req.session.user) {
        console.log("Nicht autorisierter Zugriff auf /userdata");
        return res.status(403).send("Nicht autorisiert.");
    }
});

app.put('/username', async (req, res) => {
    //ist der User nicht eingeloggt, können keine Daten geholt werden
    if (!req.session.user) {
        console.log("Nicht autorisierter Versuch, den Benutzernamen zu ändern");
        return res.status(403).send("Nicht autorisiert.");
    }
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});