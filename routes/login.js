import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const login = express.Router();
login.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

login.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Enter both email and password" });
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        const token = data.session.access_token;
        const now = new Date();
        const logdate = now.toISOString().split("T")[0];
        const logtime = now.toTimeString().split(" ")[0];

        // Logging admin login
        const { error: logError } = await supabase
            .from("adminlogs")
            .insert([{ activity: "Admin Logged in", date: logdate, time: logtime }]);

        if (logError) {
            return res.status(500).json({ error: logError.message });
        }

        return res.status(200).json({ message: "Success", token });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

export default login;
