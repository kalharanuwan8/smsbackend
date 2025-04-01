import express from 'express'
import dotenv from "dotenv"
import { createClient } from '@supabase/supabase-js'

dotenv.config();
const logs = express.Router();
logs.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);

logs.get("/", async (req, res)=>
{
    try {
        const {data, error} = await supabase
    .from("adminlogs")
    .select("*")
    if(error)
        {
            res.status(500).json({error: error.message})
        }
        res.json(data);
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
})

// Download logs as CSV
logs.get("/download", async (req, res) => {
    try {
        const {data, error} = await supabase
            .from("adminlogs")
            .select("*")
            
        if(error) {
            return res.status(500).json({error: error.message})
        }
        
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=admin_logs.csv');
        
        // Create CSV header
        let csv = 'Attempt,Email,Date,Time\n';
        
        // Add data rows
        data.forEach(log => {
            csv += `${log.attempt || ''},${log.admin_mail || ''},${log.date || ''},${log.time || ''}\n`;
        });
        
        res.send(csv);
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
});

export default logs;