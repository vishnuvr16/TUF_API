const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require("dotenv")

dotenv.config()

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Get all flashcards
app.get('/flashcards', (req, res) => {
    const sql = 'SELECT * FROM flashcards';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// Add a new flashcard
app.post('/flashcards', (req, res) => {
    const { question, answer } = req.body;
    const sql = 'INSERT INTO flashcards (question, answer) VALUES (?, ?)';
    db.query(sql, [question, answer], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, question, answer });
    });
});

app.put('/flashcards/:id', (req, res) => {
    const id = req.params.id;
    const updatedCard = req.body;

    db.query('UPDATE flashcards SET ? WHERE id = ?', [updatedCard, id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }
        res.json({ id: id, ...updatedCard });
    });
});

// Delete a flashcard
app.delete('/flashcards/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM flashcards WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));