import User from '../models/user.js';
import Role from '../models/role.js';

import jwt from 'jsonwebtoken';

/**
 * Register a new user
 * @param {Object} req - Request object with the user data: username, email, password, roles
 * @param {Object} res - Response object: token
 * @returns {Object} - Response object with the token
 */
export const register = async (req, res) => {
  const { username, email, password, roles } = req.body;
  if (!username || !email) 
    return res.status(400).json({ message: 'Username and email are required' });
  if (!password) 
    return res.status(400).json({ message: 'Password is required' });

  const newUser = new User({ username, email, password: await User.encryptPassword(password) });

  if (roles) {
    const foundRoles = await Role.find({ name: { $in: roles } });
    newUser.roles = foundRoles.map(role => role._id);
  } else {
    const role = await Role.findOne({ name: 'user' });
    newUser.roles = [role._id];
  }

  const user = await newUser.save();  // Save the user in the database


  const publicData = {                // Public data to send in the token. Can be accessed in the frontend
    username: user.username,
    email: user.email,
    level: user.level,
    experience: user.experience,
  };

  jwt.sign({ id: user._id, publicData: publicData }, process.env.SECRET, {
    expiresIn: 86400                  // 24 hours
  }, (error, token) => {
    res.status(201).json({ token });  // Send the token in the response
  });
}

/**
 * Login a user
 * @param {Object} req - Request object with the user data: email, password
 * @param {Object} res - Response object: token
 * @returns {Object} - Response object with the token
 */
export const login = async (req, res) => {
  const userFound = await User.findOne({ email: req.body.email }).populate('roles');
  if (!userFound) return res.status(400).json({ message: 'User not found' });

  const matchPassword = await User.comparePassword(req.body.password, userFound.password);
  if (!matchPassword) return res.status(401).json({ token: null, message: 'Invalid password' });

  const publicData = {                // Public data to send in the token. Can be accessed in the frontend
    username: userFound.username,
    email: userFound.email,
    level: userFound.level,
    experience: userFound.experience,
  };

  const token = jwt.sign({ id: userFound._id, publicData: publicData }, process.env.SECRET, {
    expiresIn: 86400                  // 24 hours
  });

  res.status(201).cookie('access_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 86400 * 1000              // 24 hours
  }).json({ token: token });
}