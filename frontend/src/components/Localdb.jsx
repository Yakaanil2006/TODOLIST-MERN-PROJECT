import React, { useState, useEffect } from "react";

// Use the environment variable for the API URL
const apiUrl = process.env.REACT_APP_API_URL;

export default function Localdb() {
  const [task, setTask] = useState({ title: "", time: "", date: "", category: "", completed: false });
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);

  const categories = ["Work", "Study", "Personal", "Shopping", "Health", "Other"];

  // Fetch tasks from server
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${apiUrl}/tasks`); // Updated
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();
  }, []);

  // Add or update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.title.trim()) return alert("Enter a task title!");

    try {
      if (editId) {
        const updated = await fetch(`${apiUrl}/tasks/${editId}`, { // Updated
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        }).then(res => res.json());

        setTasks(prev => prev.map(t => t._id === editId ? updated : t));
      } else {
        const created = await fetch(`${apiUrl}/tasks`, { // Updated
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        }).then(res => res.json());

        setTasks(prev => [created, ...prev]);
      }

      setTask({ title: "", time: "", date: "", category: "", completed: false });
      setEditId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    await fetch(`${apiUrl}/tasks/${id}`, { method: "DELETE" }); // Updated
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  // Toggle complete
  const toggleComplete = async (id, completed) => {
    const updated = await fetch(`${apiUrl}/tasks/${id}`, { // Updated
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    }).then(res => res.json());

    setTasks(prev => prev.map(t => t._id === id ? updated : t));
  };

  // Edit task
  const handleEdit = (t) => {
    setTask(t);
    setEditId(t._id);
  };

  // Format 24-hour time to 12-hour format with AM/PM
  const formatTime12Hr = (time24) => {
    if (!time24) return "--:--";
    let [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>✨ Task Manager</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Task title..."
            value={task.title}
            onChange={e => setTask({ ...task, title: e.target.value })}
            style={styles.input}
          />
          <input
            type="time"
            value={task.time}
            onChange={e => setTask({ ...task, time: e.target.value })}
            style={styles.input}
          />
          <input
            type="date"
            value={task.date}
            onChange={e => setTask({ ...task, date: e.target.value })}
            style={styles.input}
          />
          <select
            value={task.category}
            onChange={e => setTask({ ...task, category: e.target.value })}
            style={styles.select}
          >
            <option value="">Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" style={styles.button}>{editId ? "Update" : "Add"}</button>
        </form>

        <TaskSection title="📋 Pending Tasks" tasks={pendingTasks} toggleComplete={toggleComplete} handleEdit={handleEdit} deleteTask={deleteTask} formatTime={formatTime12Hr} />
        <TaskSection title="✅ Completed Tasks" tasks={completedTasks} toggleComplete={toggleComplete} handleEdit={handleEdit} deleteTask={deleteTask} formatTime={formatTime12Hr} />
      </div>
    </div>
  );
}

function TaskSection({ title, tasks, toggleComplete, handleEdit, deleteTask, formatTime }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h2 style={styles.subHeading}>{title}</h2>
      {tasks.length === 0 ? <p style={styles.empty}>No tasks!</p> :
        tasks.map(t => <TaskCard key={t._id} task={t} toggleComplete={toggleComplete} handleEdit={handleEdit} deleteTask={deleteTask} formatTime={formatTime} />)}
    </div>
  );
}

function TaskCard({ task, toggleComplete, handleEdit, deleteTask, formatTime }) {
  const colors = { Work: "#f39c12", Study: "#8e44ad", Personal: "#3498db", Shopping: "#e67e22", Health: "#2ecc71", Other: "#95a5a6" };

  return (
    <div
      style={{
        ...styles.card,
        background: task.completed ? "linear-gradient(135deg, #2ecc71, #27ae60)" : "linear-gradient(135deg, #34495e, #2c3e50)",
        transform: "scale(1)",
        transition: "0.3s ease-in-out",
        cursor: "pointer",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <div>
        <h3 style={{ color: "#fff", margin: 0, fontWeight: "600" }}>{task.title}</h3>
        <p style={{ color: "#ddd", margin: "5px 0", fontSize: 14 }}>
          🕒 {formatTime(task.time)} | 📅 {task.date || "No date"}
        </p>
        {task.category && <span style={{ ...styles.badge, background: colors[task.category], boxShadow: `0 0 5px ${colors[task.category]}` }}>{task.category}</span>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => toggleComplete(task._id, task.completed)} style={{ ...styles.actionBtn, background: "#3498db", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>{task.completed ? "Undo" : "Done"}</button>
        {!task.completed && <button onClick={() => handleEdit(task)} style={{ ...styles.actionBtn, background: "#f1c40f", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>Edit</button>}
        <button onClick={() => deleteTask(task._id)} style={{ ...styles.actionBtn, background: "#e74c3c", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>Delete</button>
      </div>
    </div>
  );
}

// Styles
const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #000000ff, #050505ff)", padding: 20, fontFamily: "Segoe UI, sans-serif" },
  container: { maxWidth: 900, margin: "auto", background: "rgba(0,0,0,0.9)", borderRadius: 20, padding: 35, boxShadow: "0 0 20px rgba(0,0,0,0.5)" },
  title: { textAlign: "center", color: "#fff", fontSize: 36, marginBottom: 30, textShadow: "1px 1px 4px rgba(0,0,0,0.6)" },
  form: { display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 30 },
  input: { padding: 12, borderRadius: 12, border: "none", outline: "none", flex: 1, minWidth: 140, fontSize: 14 },
  select: { padding: 12, borderRadius: 12, border: "none", flex: 1, minWidth: 140, fontSize: 14 },
  button: { background: "#27ae60", color: "#fff", border: "none", padding: "12px 25px", borderRadius: 12, cursor: "pointer", fontWeight: "bold", transition: "0.3s", fontSize: 15 },
  subHeading: { color: "#fff", borderBottom: "2px solid #27ae60", marginBottom: 15, fontSize: 20 },
  card: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderRadius: 16, margin: "12px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" },
  badge: { color: "#fff", padding: "5px 12px", borderRadius: 25, fontSize: 12, marginTop: 6, display: "inline-block", fontWeight: 500 },
  actionBtn: { border: "none", color: "#fff", padding: "8px 14px", borderRadius: 10, fontWeight: "600", cursor: "pointer", transition: "0.2s" },
  empty: { color: "#bbb", textAlign: "center", marginTop: 15, fontSize: 14 },
};
