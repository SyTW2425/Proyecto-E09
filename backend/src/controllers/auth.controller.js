import User from '../models/user.model';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { username, email, password, roles } = req.body;
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
      res.sendStatus(500);
    }
    res.status(201).json({ token });
  });

  res.status(201).json(user);
}

export const login = async (req, res) => {
  const userFound = await User.findOne({ email: req.body.email }).populate('roles');  // Populate roles for the user found in the database to get the role name
  if (!userFound) return res.status(400).json({ message: 'User not found' });

  const matchPassword = await User.comparePassword(req.body.password, userFound.password);
  if (!matchPassword) return res.status(401).json({ token: null, message: 'Invalid password' });
  
  res.json({token: jwt.sign({ id: userFound._id }, process.env.SECRET, {
    expiresIn: 86400 // 24 hours
  })});
}