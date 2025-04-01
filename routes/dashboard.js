import { createClient } from "@supabase/supabase-js";
import express from "express";

const dashboard = express.Router();

// Initialize Supabase client once
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Route to get student count
dashboard.get("/stcount", async (req, res) => {
    try {
        const { count, error } = await supabase
            .from("student_details")
            .select("*", { count: "exact", head: true }); // Fetch only count

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ studentCount: count });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Route to get course count
dashboard.get("/coursecount", async (req, res) => {
    try {
        const { count, error } = await supabase
            .from("courses")
            .select("*", { count: "exact", head: true }); // Fetch only count

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ courseCount: count });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default dashboard;
