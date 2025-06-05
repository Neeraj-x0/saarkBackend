/**
 * Notify when a task is assigned to an employee
 * @param {Object} task - The task object
 */
function notifyAssignedTask(task) {
    if (!global._io || !task?.assignedEmployee) return;
    global._io.to(task.assignedEmployee.toString()).emit("task:assigned", {
        taskId: task._id,
        title: task.title,
        assignedBy: task.user
    });
}



/**
 * Notify when a task is updated
 * @param {Object} task - The updated task
 * @param {Object} updates - The fields that were updated
 */
function notifyTaskUpdate(task, updates) {
    if (!global._io || !task?.assignedEmployee) return;
    global._io.to(task.assignedEmployee.toString()).emit("task:updated", {
        taskId: task._id,
        title: task.title,
        updates: updates
    });
}

/**
 * Notify when a task status is changed to completed
 * @param {Object} task - The completed task
 */
function notifyTaskCompleted(task) {
    if (!global._io || !task?.user) return;

    global._io.to(task.user.toString()).emit("task:completed", {
        taskId: task._id,
        title: task.title
    });
}

module.exports = { 
    notifyAssignedTask,
    notifyTaskUpdate,
    notifyTaskCompleted
};
