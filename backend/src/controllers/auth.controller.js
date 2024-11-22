import User from '../models/user.js';
import Role from '../models/role.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { username, email, password, roles } = req.body;
  console.log(req.body);
  const newUser = new User({ username, email, password: await User.encryptPassword(password) });
  
  if (roles) {
    const foundRoles = await Role.find({ name: { $in: roles } });
    newUser.roles = foundRoles.map(role => role._id);
  } else {
    const role = await Role.findOne({ name: 'user' });
    newUser.roles = [role._id];
  }
  
  const user = await newUser.save();
  
 jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: 86400 // 24 hours
  }, (error, token) => {
    if (error) {
      console.error(error.message);
      return res.sendStatus(500);
    }
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
  };
  
  res.status(201).json({token: jwt.sign({ id: userFound._id }, process.env.SECRET, {
    expiresIn: 86400 // 24 hours
  }), user: publicData});
}