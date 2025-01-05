import User from '../models/user.js';
import Role from '../models/role.js';

import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import e from 'express';

export const register = async (req, res) => {
  const { username, email, password, roles } = req.body;
  if (!username || !email) {
    return res.status(400).json({ message: 'Username and email are required' });
  } else if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  const newUser = new User({ username, email, password: await User.encryptPassword(password) });
  
  if (roles) {
    const foundRoles = await Role.find({ name: { $in: roles } });
    newUser.roles = foundRoles.map(role => role._id);
  } else {
    const role = await Role.findOne({ name: 'user' });
    newUser.roles = [role._id];
  }
  
  const user = await newUser.save();

  const publicData = {
    username: user.username,
    email: user.email,
    level: user.level,
    experience: user.experience,
  };
  
 jwt.sign({ id: user._id, publicData: publicData }, process.env.SECRET, {
    expiresIn: 86400 // 24 hours
  }, (error, token) => {
    res.status(201).json({ token });
  });
}

export const login = async (req, res) => {
  const userFound = await User.findOne({ email: req.body.email }).populate('roles');
  if (!userFound) return res.status(400).json({ message: 'User not found' });

  const matchPassword = await User.comparePassword(req.body.password, userFound.password);
  if (!matchPassword) return res.status(401).json({ token: null, message: 'Invalid password' });

  const publicData = {
    username: userFound.username,
    email: userFound.email,
    level: userFound.level,
    experience: userFound.experience,
  };
  
  const token = jwt.sign({ id: userFound._id, publicData: publicData }, process.env.SECRET, {
    expiresIn: 86400 // 24 hours
  });

  res.status(201).cookie('access_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 86400 * 1000 // 24 hours
  }).json({ token: token }); //.json({ user: publicData, token: token });
}