const express = require('express');

const { verifyToken } = require('../utils/jwt.util');

const authMiddleware = (req, res, next) => {

    if (!req.headers['authorization']) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded; // Attach user info to request object
    next();
}

module.exports = authMiddleware;