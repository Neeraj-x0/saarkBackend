const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET

/**
 * Generates a JSON Web Token (JWT) for the given user.
 *
 * @param {Object} user - The user object containing necessary information.
 * @param {string|Object} user._id - The unique identifier of the user.
 * @param {string} user.role - The role assigned to the user.
 * @returns {string} The generated JWT token.
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        secret,
        { expiresIn: '3h' }
    );
}

/**
 * Verifies the provided JSON Web Token using the secret key and returns the decoded payload.
 *
 * @param {string} token - The JSON Web Token to verify.
 * @returns {Object|null} The decoded payload if the token is valid, null otherwise.
 */

const verifyToken = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
}

module.exports = {
    generateToken,
    verifyToken
};

