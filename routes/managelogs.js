import express from 'express'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config();
const managelogs = express.Router();
managelogs.use(express.json())
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

managelogs.get("/", async (req, res)=>
{
    try {
        const {data, error} = await supabase
        .from("adminlogs")
        .select("*")
        if(error)
        {
            return res.status(500).json({error: error.message})
        }
        res.json(data);
        
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}
)

export default managelogs;