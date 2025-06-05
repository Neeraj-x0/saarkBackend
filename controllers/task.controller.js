const Task = require('../model/task.model');
const User = require('../model/user.model');
const { 
    notifyAssignedTask, 
    notifyTaskUpdate, 
    notifyTaskCompleted 
} = require('../utils/notify.utils');

/**
 * Creates a new task and associates it with a user.
 *
 * @async
 * @function createTask
 * @param {string} userid - The ID of the user creating the task.
 * @param {{
 *   title: string,
 *   assignedEmployee: import('mongoose').Types.ObjectId,
 *   status: "pending" | "completed" | "in-progress",
 *   user: import('mongoose').Types.ObjectId,
 *   description?: string,
 *   dueDate?: Date
 * }} taskData - Task details.
 * @returns {Promise<Object>} Newly created task.
 */
const createTask = async (userid, taskData) => {
    try {
        const task = new Task({ ...taskData, user: userid });
        await task.save();

        // Notify the assigned employee about the new task
        notifyAssignedTask(task);

        return task;
    } catch (err) {
        throw new Error(err.message || 'Failed to create task');
    }
};

/**
 * Fetches all tasks linked to a specific user.
 *
 * @async
 * @function getTasksByUser
 * @param {string} userid - ID of the user.
 * @returns {Promise<Array>} List of tasks.
 */
const getTasksByUser = async (userid) => {
    try {
        return await Task.find({ user: userid }).populate('assignedEmployee', 'name email');
    } catch (err) {
        throw new Error(err.message || 'Unable to fetch user tasks');
    }
};

/**
 * Finds a task using its unique ID.
 *
 * @async
 * @function getTaskById
 * @param {string} taskId - Task identifier.
 * @returns {Promise<Object>} Task object.
 */
const getTaskById = async (taskId) => {
    try {
        return await Task.findById(taskId);
    } catch (err) {
        throw new Error(err.message || 'Task lookup failed');
    }
};

/**
 * Retrieves every task in the system with extra user info.
 *
 * @async
 * @function getAllTasks
 * @returns {Promise<Array>} List of all tasks.
 */
const getAllTasks = async () => {
    try {
        const rawTasks = await Task.find()
            .populate('user', 'name email')
            .populate('assignedEmployee', 'name email');

        const enriched = await Promise.all(
            rawTasks.map(async (task) => {
                const assigner = task.user
                    ? await User.findById(task.user)
                    : null;

                return {
                    ...task.toObject(),
                    assignedBy: assigner ? assigner.name : null,
                };
            })
        );

        return enriched;
    } catch (err) {
        throw new Error(err.message || 'Could not fetch tasks');
    }
};

/**
 * Updates an existing task using its ID.
 *
 * @async
 * @function updateTask
 * @param {string} taskId - Task ID.
 * @param {Object} taskData - Updated fields.
 * @returns {Promise<Object>} Updated task.
 */
const updateTask = async (taskId, taskData) => {
    try {
        const updated = await Task.findByIdAndUpdate(taskId, taskData, { new: true });
        if (!updated) throw new Error('Task not found');
        
        // Notify the assigned employee about the task update
        notifyTaskUpdate(updated, taskData);
        
        return updated;
    } catch (err) {
        throw new Error(err.message || 'Update failed');
    }
};

/**
 * Removes a task by its ID.
 *
 * @async
 * @function deleteTask
 * @param {string} taskId - ID of task to delete.
 * @returns {Promise<Object>} Deleted task.
 */
const deleteTask = async (taskId) => {
    try {
        const removed = await Task.findByIdAndDelete(taskId);
        if (!removed) throw new Error('Task not found');
        return removed;
    } catch (err) {
        throw new Error(err.message || 'Deletion failed');
    }
};

/**
 * Assigns an employee to a task.
 *
 * @async
 * @function assignTaskToEmployee
 * @param {string} taskId - Task ID.
 * @param {string} employeeId - Employee ID.
 * @returns {Promise<Object>} Updated task.
 */
const assignTaskToEmployee = async (taskId, employeeId) => {
    try {
        const result = await Task.findByIdAndUpdate(taskId, { assignedEmployee: employeeId }, { new: true });
        if (!result) throw new Error('Task not found');
        return result;
    } catch (err) {
        throw new Error(err.message || 'Assignment failed');
    }
};

/**
 * Gets tasks assigned to a specific employee.
 *
 * @async
 * @function getTasksByEmployee
 * @param {string} employeeId - ID of the employee.
 * @returns {Promise<Array>} Array of tasks.
 */
const getTasksByEmployee = async (employeeId) => {
    try {
        const rawTasks = await Task.find({ assignedEmployee: employeeId }).populate('user', 'name email');
        const enriched = await Promise.all(
            rawTasks.map(async (task) => {
                const assigner = task.user
                    ? await User.findById(task.user)
                    : null;

                return {
                    ...task.toObject(),
                    assignedBy: assigner ? assigner.name : null,
                };
            })
        );
        return enriched;
    } catch (err) {
        throw new Error(err.message || 'Unable to fetch employee tasks');
    }
};

/**
 * Changes the status of a task.
 *
 * @async
 * @function updateTaskStatus
 * @param {string} taskId - ID of the task.
 * @param {"pending" | "completed" | "in-progress"} status - New status.
 * @returns {Promise<Object>} Updated task.
 */
const updateTaskStatus = async (taskId, status) => {
    try {
        const result = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
        if (!result) throw new Error('Task not found');
        if (status === 'completed') {
            notifyTaskCompleted(result);
        } else {
            notifyTaskUpdate(result, { status });
        }
        
        return result;
    } catch (err) {
        throw new Error(err.message || 'Failed to update status');
    }
};

module.exports = {
    createTask,
    getTasksByUser,
    getTasksByEmployee,
    getTaskById,
    getAllTasks,
    updateTask,
    deleteTask,
    assignTaskToEmployee,
    updateTaskStatus
};
