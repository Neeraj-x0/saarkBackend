/* * @file task.validation.js
 * @description This file contains the Zod validation schema for task-related operations.
    * It defines the structure and validation rules for creating, updating, assigning, deleting, and retrieving tasks.
    * @requires zod - schema declaration and validation library.
    * @exports taskSchema - Express middleware functions for task validation.
    */

const { z } = require('zod');

// Schemas
const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    assignedEmployee: z.string().min(1, 'Employee ID is required'),
    dueDate: z.string().optional(), // Accept ISO string, transform to Date in controller
    status: z.enum(['pending', 'in-progress', 'completed']).default('pending')
});

const updateTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    assignedEmployee: z.string().min(1, 'Employee ID is required').optional(),
    dueDate: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']).optional()
});

const taskIdSchema = z.object({
    id: z.string().min(1, 'Task ID is required')
});

const userIdSchema = z.object({
    userId: z.string().min(1, 'User ID is required')
});

const statusUpdateSchema = z.object({
    status: z.enum(['pending', 'in-progress', 'completed'], 'Invalid status value')
});

// Create middleware functions
const validate = (schema, paramName = null) => (req, res, next) => {
    try {
        // For route params (e.g., :id)
        if (paramName && req.params[paramName]) {
            schema.parse({ [paramName]: req.params[paramName] });
        } 
        // For request body
        else if (Object.keys(req.body).length > 0) {
            schema.parse(req.body);
        }
        
        next();
    } catch (error) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: error.errors ? error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            })) : [{ message: error.message }]
        });
    }
};

// Export middleware functions
module.exports = {
    create: validate(createTaskSchema),
    update: validate(updateTaskSchema),
    delete: validate(taskIdSchema, 'id'),
    getById: validate(taskIdSchema, 'id'),
    getByUser: validate(userIdSchema, 'userId'),
    updateStatus: validate(statusUpdateSchema)
};
