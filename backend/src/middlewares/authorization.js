import jwt from 'jsonwebtoken';

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

export const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roles = await Role.find({ _id: { $in: user.roles } });
  
  for (let i = 0; i < roles.length; i++) {
    if (roles[i].name === 'admin') {
      next();
      return;
    }
  }
  return res.status(403).json({ message: 'Require admin role' });
}

export const isModerator = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roles = await Role.find({ _id: { $in: user.roles } });
  
  for (let i = 0; i < roles.length; i++) {
    if (roles[i].name === 'moderator' || roles[i].name === 'admin') {  // if moderator can access admin too
      next();
      return;
    }
  }
  return res.status(403).json({ message: 'Require moderator role' });
}
