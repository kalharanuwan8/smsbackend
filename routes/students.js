import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const students = express.Router();
students.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Fetch all students
students.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase.from("student_details").select("*");
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// Add a new student
students.post("/addstudents", async (req, res) => {
    try {
        const { student_type, first_name, last_name, address, dob, nic, degree, currentyear, semester } = req.body;

        if (!student_type || !first_name || !last_name || !address || !dob || !nic || !degree || !currentyear || !semester) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const { data, error } = await supabase.from("student_details").insert([
            { student_type, first_name, last_name, address, dob, nic, degree, currentyear, semester }
        ]);

        if (error) return res.status(500).json({ error: error.message });

        await supabase.from("adminlogs").insert([
            { activity: "Added a new student", date: new Date().toISOString().split("T")[0], time: new Date().toTimeString().split(" ")[0] }
        ]);

        return res.status(201).json({ message: "Student added successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// Search for students
students.post("/searchstudents", async (req, res) => {
    try {
        const { searchterm } = req.body;

        if (!searchterm || searchterm.trim() === "") return res.status(400).json({ error: "Search term cannot be empty" });

        const sanitizedSearch = searchterm.trim();
        const searchPattern = `%${sanitizedSearch}%`;
        const numericSearch = Number(sanitizedSearch);
        const isNumeric = !isNaN(numericSearch);

        let query = supabase
            .from("student_details")
            .select("student_type, first_name, last_name, address, dob, nic, degree, currentyear, semester")
            .or([
                `student_type.ilike.${searchPattern}`,
                `first_name.ilike.${searchPattern}`,
                `last_name.ilike.${searchPattern}`,
                `address.ilike.${searchPattern}`,
                `nic.ilike.${searchPattern}`,
                `degree.ilike.${searchPattern}`,
                isNumeric ? `currentyear.eq.${numericSearch}` : "",
                isNumeric ? `semester.eq.${numericSearch}` : ""
            ].filter(Boolean).join(","));

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: "Failed to search students: " + error.message });

        await supabase.from("adminlogs").insert([
            { activity: "Searched for students", date: new Date().toISOString().split("T")[0], time: new Date().toTimeString().split(" ")[0] }
        ]);

        return res.status(200).json({ students: data || [] });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// Delete a student
students.delete("/", async (req, res) => {
    try {
        const { student_no } = req.body;

        if (!student_no) return res.status(400).json({ error: "student_no is required" });

        const { error } = await supabase.from("student_details").delete().eq("student_no", student_no);
        if (error) return res.status(500).json({ error: error.message });

        await supabase.from("adminlogs").insert([
            { activity: "Deleted a student", date: new Date().toISOString().split("T")[0], time: new Date().toTimeString().split(" ")[0] }
        ]);

        return res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// Update student details
students.put("/", async (req, res) => {
    try {
        const { student_no, student_type, first_name, last_name, address, dob, nic, degree, currentyear, semester } = req.body;

        if (!student_no) return res.status(400).json({ error: "Student number is required" });

        const updateData = {};
        if (student_type) updateData.student_type = student_type;
        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;
        if (address) updateData.address = address;
        if (dob) updateData.dob = dob;
        if (nic) updateData.nic = nic;
        if (degree) updateData.degree = degree;
        if (currentyear) updateData.currentyear = currentyear;
        if (semester) updateData.semester = semester;

        if (Object.keys(updateData).length === 0) return res.status(400).json({ error: "At least one field to update is required" });

        const { error } = await supabase.from("student_details").update(updateData).eq("student_no", student_no);
        if (error) return res.status(500).json({ error: "Failed to update student: " + error.message });

        await supabase.from("adminlogs").insert([
            { activity: "Updated student details", date: new Date().toISOString().split("T")[0], time: new Date().toTimeString().split(" ")[0] }
        ]);

        return res.status(200).json({ message: "Student updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

// Fetch academic history
students.post("/history", async (req, res) => {
    try {
        const { currentyear, sem } = req.body;

        const { data, error } = await supabase
            .from("degree")
            .select("*")
            .or(`year.lt.${currentyear},year.eq.${currentyear}.and(semester.lte.${sem})`);

        if (error) return res.status(500).json({ error: error.message });

        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error: " + error.message });
    }
});

export default students;
