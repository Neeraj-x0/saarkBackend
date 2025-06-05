const express = require('express');

const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        const userRole = req.user?.role; // Assuming user info is attached to req by auth middleware
        console.log(req.user)
        if (!userRole) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (userRole !== requiredRole) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
    };
}

module.exports = roleMiddleware;

