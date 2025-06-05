const { Router } = require("express");
const {
    createTask,
    getTasksByUser,
    getTaskById,
    assignTaskToEmployee,
    deleteTask,
    updateTask,
    getTasksByEmployee,
    getAllTasks,
    updateTaskStatus
} = require("../controllers/task.controller");
const taskSchema = require("../validation/task.validation");
const roleMiddleware = require("../middlewares/role.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const { 
    notifyAssignedTask, 
    notifyTaskUpdate, 
    notifyTaskCompleted 
} = require("../utils/notify.utils");

const router = Router();

router.use(authMiddleware);

// Create task
router.post("/", roleMiddleware("manager"), taskSchema.create, async (req, res) => {
    try {
        const { title, description, assignedEmployee, dueDate } = req.body;
        const task = await createTask(req.user.id, {
            title,
            description,
            assignedEmployee,
            dueDate
        });
        notifyAssignedTask(task);
        res.status(201).json({ message: "Task created", task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List tasks
router.get("/", async (req, res) => {
    try {
        const tasks = req.user.role.toLowerCase() === "manager"
            ? await getAllTasks()
            : await getTasksByEmployee(req.user.id);
        res.status(200).json({ tasks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single task
router.get("/:id", taskSchema.getById, async (req, res) => {
    try {
        const task = await getTaskById(req.params.id);
        if (!task) return res.status(404).json({ error: "Not found" });
        res.status(200).json({ task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update task
router.put("/:id", roleMiddleware("manager"), taskSchema.update, async (req, res) => {
    try {
        const task = await updateTask(req.params.id, req.body);
        // If assignee changed, send assigned notification, otherwise send update notification
        if (req.body.assignedEmployee) {
            notifyAssignedTask(task);
        } else {
            notifyTaskUpdate(task, req.body);
        }
        res.status(200).json({ message: "Updated", task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete task
router.delete("/:id", roleMiddleware("manager"), taskSchema.delete, async (req, res) => {
    try {
        await deleteTask(req.params.id);
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change task status
router.patch("/:id/status", taskSchema.updateStatus, async (req, res) => {
    try {
        const task = await getTaskById(req.params.id);
        if (!task) return res.status(404).json({ error: "Not found" });

        const isManager = req.user.role.toLowerCase() === "manager";
        const isOwner = task.assignedEmployee.toString() === req.user.id;

        if (!isManager && !isOwner) {
            return res.status(403).json({ error: "Not allowed" });
        }

        const updated = await updateTaskStatus(req.params.id, req.body.status);
        
        if (req.body.status === "completed") {
            notifyTaskCompleted(updated);
        } else if (isManager) {
            notifyAssignedTask(updated);
        } else {
            notifyTaskUpdate(updated, { status: req.body.status });
        }
        
        res.status(200).json({ message: "Status updated", task: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user tasks
router.get("/user/:userId", taskSchema.getByUser, async (req, res) => {
    try {
        const tasks = await getTasksByUser(req.params.userId);
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
