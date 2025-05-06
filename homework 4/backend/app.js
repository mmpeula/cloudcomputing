const express    = require('express');
const mssql      = require('mssql');
const bodyParser = require('body-parser');
const cors       = require('cors');
require('dotenv').config();

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing  = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing variables in .env → ${missing.join(', ')}`);
  process.exit(1);
}

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, 
    trustServerCertificate: true, 
  },
};

const poolPromise = mssql.connect(sqlConfig).then(pool => {
  console.log('Connected to SQL Server');
  return pool;
}).catch(err => {
  console.error('Error connecting to SQL Server:', err.message);
  process.exit(1);
});

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.post('/tasks', async (req, res) => {
  const { task_name, due_date, status } = req.body;

  if (!task_name || !due_date || !status) {
    return res.status(400).json({ error: 'All fields (task_name, due_date, status) are required.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('task_name', mssql.NVarChar, task_name)
      .input('due_date', mssql.Date, due_date)
      .input('status', mssql.NVarChar, status)
      .query('INSERT INTO tasks (task_name, due_date, status) VALUES (@task_name, @due_date, @status)');
    
    res.status(201).json({ id: result.rowsAffected[0], task_name, due_date, status });
  } catch (err) {
    console.error('Error during POST /tasks:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/tasks', async (_req, res, next) => {
  try {
    const pool = await poolPromise; 
    const result = await pool.request().query('SELECT * FROM tasks'); 
    res.json(result.recordset);
  } catch (err) {
    next(err); 
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await poolPromise;
    console.log(`✅ API listening on http://localhost:${PORT}`);
  } catch (err) {
    console.error('🚫 Could not connect to the database:', err.message);
    process.exit(1);
  }
});
