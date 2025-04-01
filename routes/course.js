import express from 'express'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config();
const course = express.Router();
course.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

course.get("/", async (req, res)=>
{
    try {
        const {data, error} = await supabase
        .from("courses")
        .select("*")

        if(error)
        {
            return res.status(500).json({error: error.message})
        }
        res.json(data);
    } catch (err) {
            return res.status(500).json({error: err.message})
    }
})

course.post("/", async (req,res)=>
{
    const {courseid, coursename} = req.body;
    if (!courseid || !coursename)
    {
        res.status(400).json("all fields required")
    }
    try {
        const {data, error} = await supabase
        .from("courses")
        .insert([
            {
                courseid,
                coursename
            }
        ]);
        if (error)
        {
            return res.status(500).json({error: error.message});
        }
        const {data: newlogdata, error: newlogerror} = await supabase
        .from("adminlogs")
        .insert([
            {
                activity: "Course Added",
                date: new Date().toISOString().split("T")[0],
                time: new Date().toTimeString().split(" ")[0]
            }])
            return res.status(200).json({message: "success"})
            
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
})

course.delete("/", async (req, res)=>
{
    const {courseid} =  req.body;
    if(!courseid)
    {
        req.status(404).json({message: "enter the courseid"})
    }
    try {
        const {data, error} = await supabase
        .from("courses")
        .delete()
        .eq("courseid", courseid)
       
        if(error)
        {
            res.status(500).json({error: error.message})
        }
        const {data: newlogdata, error: newlogerror} = await supabase
        .from("adminlogs")
        .insert([
            {
                activity: "Course Deleted",
                date: new Date().toISOString().split("T")[0],
                time: new Date().toTimeString().split(" ")[0]
            }])
        res.status(200).json({message: "success"})
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
})

course.put("/", async (req, res) => {
    try {
      const { coursenno, courseid, coursename } = req.body;
  
      console.log("Request body:", req.body); // Log the full request
  
      if (!coursenno) {
        return res.status(400).json({ error: "Course number (coursenno) is required" });
      }
  
      const updateData = {};
      if (coursename) updateData.coursename = coursename;
  
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "At least one field to update is required" });
      }
  
      console.log("Update data:", updateData); // Log what’s being sent to Supabase
  
      const { data, error } = await supabase
        .from("courses")
        .update(updateData)
        .eq("coursenno", coursenno);
  
      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ error: "Failed to update course: " + error.message });
      }
      const {data: newlogdata, error: newlogerror} = await supabase
        .from("adminlogs")
        .insert([
            {
                activity: "Course Updated",
                date: new Date().toISOString().split("T")[0],
                time: new Date().toTimeString().split(" ")[0]
            }])
      return res.status(200).json({ message: "Course updated successfully" });
    } catch (err) {
      console.error("Error updating course:", err);
      return res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });
// Add this function to your course.js file
course.get("/download", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*");
        
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=courses.csv');
      
      // Create CSV header
      let csv = 'CourseNo,CourseID,CourseName\n';
      
      // Add data rows
      data.forEach(course => {
        csv += `${course.coursenno || ''},${course.courseid || ''},${course.coursename || ''}\n`;
      });
      const {data: newlogdata, error: newlogerror} = await supabase
        .from("adminlogs")
        .insert([
            {
                activity: "Course CSV Downloaded",
                date: new Date().toISOString().split("T")[0],
                time: new Date().toTimeString().split(" ")[0]
            }])
      res.send(csv);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
export default course;
