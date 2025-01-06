import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Role from '../models/role.js';

/**
 * Verify the token
 * @param {Object} req - Request object with the token: x-access-token
 * @param {Object} res - Response object: message
 * @param {Function} next - Callback function
 * @returns {Function} - Callback function
 * @throws {Object} - Response object with the error message: Unauthorized
 */
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.SECRET);
    req.userId = decoded.id;
    const user = await User.findById(req.userId, { password: 0 });  // Exclude password from the query
    if (!user) return res.status(404).json({ message: 'No user found' });

    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

/**
 * Check if the user is admin
 * @param {Object} req - Request object with the token: x-access-token
 * @param {Object} res - Response object: message
 * @param {Function} next - Callback function
 * @returns {Function} - Callback function
 * @throws {Object} - Response object with the error message: Require admin role
 */
export const isAdmin = async (req, res, next) => {
  const token = req.header('x-access-token');
  if (!token) return res.status(403).json({ message: 'No token provided' });
  const decoded = jwt.verify(token, process.env.SECRET);
  req.userId = decoded.id;
  const user = await User.findById(req.userId);
  const roles = await Role.find({ _id: { $in: user.roles } });
  for (let i = 0; i < roles.length; i++) {
    if (roles[i].name === 'admin') return next();
  }
  // If the user is not admin
  return res.status(403).json({ message: 'Require admin role' });
};

/**
 * Check if the user is moderator
 * @param {Object} req - Request object with the token: x-access-token
 * @param {Object} res - Response object: message
 * @param {Function} next - Callback function
 * @returns {Function} - Callback function
 * @throws {Object} - Response object with the error message: Require moderator role
 */
export const isModerator = async (req, res, next) => {
  const token = req.header('x-access-token');
  if (!token) return res.status(403).json({ message: 'No token provided' });
  const decoded = jwt.verify(token, process.env.SECRET);
  req.userId = decoded.id;
  const user = await User.findById(req.userId);
  const roles = await Role.find({ _id: { $in: user.roles } });
  for (let i = 0; i < roles.length; i++) {
    if (roles[i].name === 'moderator' || roles[i].name === 'admin') {  // if moderator can access admin too
      return next(); // the user is admin
    }
  }
  // If the user is not admin
  return res.status(403).json({ message: 'Require moderator role' });
}

/**
 * Check if the user is moderator or admin
 * @param {Object} req - Request object with the token: x-access-token
 * @param {Object} res - Response object: message
 * @param {Function} next - Callback function
 * @returns {Function} - Callback function
 * @throws {Object} - Response object with the error message: Require moderator role
 */
export const isMySelfOrModerator = async (req, res, next) => {
  const token = req.header('x-access-token');
  if (!token) return res.status(403).json({ message: 'No token provided' });

  const decoded = jwt.verify(token, process.env.SECRET);
  req.userId = decoded.id; // Get the user id from the token
  req.username = decoded.publicData.username; // Get the username from the token
  // Check if the user is the owner of the resource
  if (req.params.username && (req.params.username === req.username)) {
    return next();
  }
  const user = await User.findById(req.userId);
  const roles = await Role.find({ _id: { $in: user.roles } });
  if (roles.some(role => role.name === 'moderator' || role.name === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'You can only access your own information' });
};
