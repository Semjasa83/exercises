const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

function validateInput(input) {
    return !/[<>/\\{}"',]/.test(input);
}

app.post("/submit", (req, res) => {
    const value = String(req.body.userInput || ""); //Input immer in String wandeln

    if (!value.trim()) { //blocken von Leerzeichen
        return res.status(400).json({ error: "Bitte gib etwas ein." });
    }

    if (!validateInput(value)) { //validierung und entfernen sämtlicher sonderzeichen, ohne wird alles als String ausgegeben
        return res.status(400).json({ error: "Ungültige Eingabe." });
    }

    res.json({
        message: `Du hast eingegeben: ${value}`
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});