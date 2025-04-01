import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv'

dotenv.config();
const testdbrouter = express.Router();
testdbrouter.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

testdbrouter.get("/", async (req, res)=>
{
    try {
        const { data, error } = await supabase.from("admin").select("*").limit(1);
        if (error) throw error;

        res.status(200).json({ message: "Database connected", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})


export default testdbrouter;