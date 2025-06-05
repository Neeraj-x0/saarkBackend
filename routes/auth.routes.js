const { Router } = require("express");
const validator = require('../validation/auth.validation')
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const {
    register,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    getEmployees
} = require("../controllers/auth.controller");


const router = Router();

// Register route
router.post("/register",
    validator.register,
    async (req, res) => {
        try {
            const { email, password, role, name } = req.body;
            console.log(req.body)
            const user = await register(name, email, role, password);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Login route
router.post("/login",
    validator.login,
    async (req, res) => {
        try {
            const { user, token } = await login(req.body.email, req.body.password);
            res.status(200).json({ user, token });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);


// Get user profile route
router.get("/profile",
    authMiddleware,
    async (req, res) => {
        try {
            const loggedInUserId = req.user.id;
            const userRole = req.user.role;
            const user = await getUserProfile(loggedInUserId);
            res.status(200).json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
);

// Update user profile route
router.put("/profile/:userId",
    validator.updateUserProfile,
    authMiddleware,
    async (req, res, next) => {
        try {
            const userId = req.params.userId;
            console.log(req.user)
            const loggedInUserId = req.user.id;
            const userRole = req.user.role;

            if (userId !== loggedInUserId && userRole !== 'manager') {
                return res.status(403).json({ message: "Unauthorized: You can only update your own profile or you are not a manager." });
            }

            const user = await updateUserProfile(userId, req.body);
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);


// Delete user profile route
router.delete("/profile/:userId",
    validator.deleteUserProfile,
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.params.userId;
            const loggedInUserId = req.user.id;
            const userRole = req.user.role;

            if (userId !== loggedInUserId && userRole !== 'manager') {
                return res.status(403).json({ message: "Unauthorized: You can only delete your own profile or you are not a manager." });
            }
            const response = await deleteUserProfile(req.params.userId);
            res.status(200).json(response);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
);

// Get all employees (Manager only)
router.get("/employees",
    authMiddleware,
    roleMiddleware("manager"),
    async (req, res) => {
        try {
            const employees = await getEmployees();
            res.status(200).json({ employees });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

module.exports = router;