import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import testdbrouter from './routes/testdb.js';
import login from './routes/login.js';
import register from './routes/register.js';
import students from './routes/students.js';
import course from './routes/course.js';
import managelogs from './routes/managelogs.js';

import logs from './routes/logs.js';
import dashboard from './routes/dashboard.js';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/login", login);
app.use("/register", register);
app.use("/students", students);
app.use("/course", course);
app.use("/managelogs", managelogs);

app.use("/logs", logs);
app.use("/dashboard", dashboard);


app.listen(PORT, ()=>
{
    console.log(`http://localhost:${PORT}`)
})

