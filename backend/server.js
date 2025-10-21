require('dotenv').config(); // Load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
// Use environment variable for CORS origin
app.use(cors({
  origin: process.env.FRONTEND_URL 
}));
app.use(express.json());

// MongoDB Atlas connection
mongoose
  .connect(
    "mongodb+srv://anilkumar_yaka:Anil%402006@todolist.ezbua80.mongodb.net/?retryWrites=true&w=majority&appName=Todolist"
  )
  .then(() => console.log("🟢 MongoDB Atlas Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    time: { type: String, default: "" },
    date: { type: String, default: "" },
    category: { type: String, default: "" },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

// CREATE Task
app.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    const saved = await task.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ All Tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Task by ID
app.put("/tasks/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Task by ID
app.delete("/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Task deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(8080, () => console.log("🚀 Server running on http://localhost:8080"));
