const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicialização do Banco de Dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )`);
    }
});

function getItems(callback) {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        callback(err, rows);
    });
}

function addItem(title, callback) {
    db.run("INSERT INTO tasks (title) VALUES (?)", [title], function (err) {
        callback(err, { id: this ? this.lastID : null, title, completed: 0 });
    });
}

function deleteItem(id, callback) {
    db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
        callback(err);
    });
}

function updateItem(id, title, completed, callback) {
    db.run("UPDATE tasks SET title = ?, completed = ? WHERE id = ?", [title, completed, id], function (err) {
        callback(err);
    });
}


app.get('/api/tasks', (req, res) => {
    getItems((err, tasks) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(tasks);
    });
});

app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Título é obrigatório' });
    
    addItem(title, (err, newTask) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(newTask);
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    deleteItem(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.sendStatus(204);
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    updateItem(id, title, completed, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.sendStatus(200);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});