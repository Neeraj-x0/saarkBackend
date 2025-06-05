/* * @file auth.validation.js
    * @description This file contains the Zod validation schema for authentication-related operations.
    * It defines the structure and validation rules for user registration, login, profile retrieval, updating, and deletion.
    * @requires zod - schema declaration and validation library.
    * @exports authSchemas - Express middleware functions for authentication validation.
    */

const { z } = require('zod');

// Schemas
const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    role: z.enum(['manager', 'employee'], 'Role must be either manager or employee'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

const userIdSchema = z.object({
    userId: z.string().min(1, 'User ID is required')
});

const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email format').optional(),
    role: z.enum(['manager', 'employee'], 'Role must be either manager or employee').optional()
});

// Create middleware functions
const validate = (schema) => (req, res, next) => {
    try {

        const dataToValidate = req.body;
        
        if (req.params.userId && schema === userIdSchema) {
            schema.parse({ userId: req.params.userId });
        } else {
            schema.parse(dataToValidate);
        }

        next();
    } catch (error) {
        console.log('Validation error:', error);
        if (error.errors) {

            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        return res.status(400).json({ message: error.message });
    }
};


module.exports = {
    register: validate(registerSchema),
    login: validate(loginSchema),
    getUserProfile: validate(userIdSchema),
    updateUserProfile: (req, res, next) => {
        try {
            userIdSchema.parse({ userId: req.params.userId });
            if (Object.keys(req.body).length > 0) {
                updateProfileSchema.parse(req.body);
            }
            next();
        } catch (error) {
        console.log('Validation error:', error);
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors ? error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                })) : [{ message: error.message }]
            });
        }
    },
    deleteUserProfile: validate(userIdSchema)
};

