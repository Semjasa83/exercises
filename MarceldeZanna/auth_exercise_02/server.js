// const express = require("express");
// const app = express();
// const PORT = 3000;

// app.set("view engine", "ejs");
// app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//   res.render("index");
// });

// app.post("/willkommen", (req, res) => {
//   const { username } = req.body;
//   res.render("willkommen", { username });
//   console.log(`willkommen ${username}`)
// });

// app.listen(PORT, () => {
//   console.log(`Server läuft auf http://localhost:${PORT}`);
// });

const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;


app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'still secret',
        resave: false,
        saveUninitialized: true,
    })
)

const generateCsrfToken = (req) => {
  let token = req.session.csrfToken;
  if (!token) {
    token = Math.random().toString(36).substring(2, 15);
    req.session.csrfToken = token;
  }
  return token;
};

app.get('/', (req, res) => {
    const csrfToken = generateCsrfToken(reg);
    res.send('<form method="POST" action="/submit">' +
        '<input type="hidden" name="_csrf" value="' + csrfToken + '">' +
        '<input type="text" name="name" placeholder="Dein Name">' +
        '<button type="submit">Absenden</button>' +
        '</form>');
});

app.post('/submit', (req, res) => {
    if (req.body._csrf !== req.session.csrfToken) {
        res.status(403).send('CSRF-Token ungültig');
    } else {
        console.log(`Name erhalten: ${req.body.name}`);
        res.send('Name erhalten');
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});

/**
 * mein oben auskommentiertes konstrukt konnte schon mit CSRF nicht ausgeloggt werden. 
 * neben node server.js musste ich laut KI mit python noch ein 8000 dienst starten, anderweitig blockte schon der Browser.
 * ohne klassisches Login konnte ich jetzt kein JWT Bearer Token implementieren, musste daher jetzt hier die Lösung 
 * einsetzen :(
 */