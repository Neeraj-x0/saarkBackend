const User = require('../model/user.model');
const { generateToken } = require('../utils/jwt.util');
const bcrypt = require('bcryptjs');

/**
 * Retrieves all employees.
 *
 * @async
 * @function getEmployees
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of employee objects.
 * @throws {Error} Throws an error if fetching employees fails.
 */
const getEmployees = async () => {
    try {
        const employees = await User.find({ role: 'employee' }, { password: 0 });
        return employees;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw new Error('Failed to fetch employees');
    }
};


/**
 * Registers a new user.
 *
 * @async
 * @function register
 * @param {string} name - The name of the user.
 * @param {string} email - The email address of the user.
 * @param {string} role - The role of the user (e.g., admin, user).
 * @param {string} password - The password for the user account.
 * @returns {Promise<{ user: { name: string, email: string, role: "manager" | "employee" }, token: string }>} A promise that resolves to the registered user object.
 * @throws {Error} Throws an error if the registration fails.
 */
const register = async (name, email, role, password) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        console.log(password)
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            name,
            email,
            role,
            password: hashedPassword
        });

        // Generate JWT token
        const token = generateToken(newUser);

        // Remove password from user object
        const nopass = newUser.toObject();
        delete nopass.password;

        return { user: nopass, token };
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Registration failed');
    }
}


/**
 * Logs in a user.
 *
 * @async
 * @function login
 * @param {string} email - The email address of the user.
 * @param {string} password - The password for the user account.
 * @returns {Promise<{ user: { name: string, email: string, role: "manager" | "employee" }, token: string }>} A promise that resolves to the logged-in user object.
 * @throws {Error} Throws an error if the login fails.
 */
const login = async (email, password) => {
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = generateToken(user);

        // Remove password from user object
        const nopass = user.toObject();
        delete nopass.password;

        return { user: nopass, token };
    } catch (error) {
        throw new Error(error.message || 'Login failed');
    }
};


/**
 * Retrieves the profile of a user by their unique ID.
 *
 * @async
 * @function getUserProfile
 * @param {string} userId - The unique identifier of the user whose profile is to be fetched.
 * @returns {Promise<{name: string, email: string, role: "manager" | "employee"}>} A promise that resolves to the user profile object.
 * @throws {Error} Throws an error if the user is not found or if the fetching fails.
 */
const getUserProfile = async (userId) => {
    try {
        // Find user by ID
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw new Error(error.message || 'Failed to retrieve user profile');
    }
};


/**
 * Updates the profile of a user by their unique ID.
 *
 * @async
 * @function updateUserProfile
 * @param {string} userId - The unique identifier of the user to update.
 * @param {Object} updates - An object containing the updated user data.
 * @returns {Promise<Object>} A promise that resolves to the updated user object.
 * @throws {Error} Throws an error if the user is not found or if the update fails.
 */
const updateUserProfile = async (userId, updates) => {
    try {
        // Find user by ID and update
        const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw new Error(error.message || 'Failed to update user profile');
    }
}


/**
 * Deletes a user profile by its unique ID.
 *
 * @async
 * @function deleteUserProfile
 * @param {string} userId - The unique identifier of the user to delete.
 * @returns {Promise<Object>} A promise that resolves to a success message.
 * @throws {Error} Throws an error if the user is not found or if the deletion fails.
 */
const deleteUserProfile = async (userId) => {
    try {
        // Find user by ID and delete
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return { message: 'User deleted successfully' };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete user profile');
    }
}


module.exports = {
    register,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    getEmployees
};
