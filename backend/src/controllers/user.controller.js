import User from '../models/user.js';

/**
 * Create a new user
 * @param {Request} req Request object: username, email, password
 * @param {Response} res Response object: message, user
 * @returns {Response} Response object with the message and the user created
 */
export const createUser = async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json({ message: 'User created successfully', user });
}

/**
 * Delete a user by ID
 * @param {Request} req Request object: id
 * @param {Response} res Response object: message
 * @returns {Response} Response object with the message
 */
export const deleteById = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ message: `User with ID ${req.params.id} deleted` });
};

/**
 * Get a user by ID, username, or email
 * @param {Request} req Request object: id, username, email
 * @param {Response} res Response object: user
 * @returns {Response} Response object with the user
 */
export const getUser = async (req, res) => {
  const { id, username, email } = req.query; // Get query parameters
  if (req.query.password) {
    return res.status(404).send({ message: 'Cannot get user by password' });
  }

  // Update by ID
  if (id) {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    return res.send(user);
  }
  // Update by username
  if (username) {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    return res.send(user);
  }
  // Update by email
  if (email) {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    return res.send(user);
  }

  // If no query parameters are provided, return all users
  const users = await User.find({});
  return res.send(users);

}

/**
 * Get a user by username
 * @param {Request} req Request object: username
 * @param {Response} res Response object: user
 * @returns {Response} Response object with the user
 */
export const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne().where('username').equals(username);
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }
  return res.send(user);
}

export const updateUser = async (req, res) => {
  const { id, username, email } = req.body;
  let filter = null;
  if (id) filter = { _id: id };

  // If no filter is provided, return an error
  if (!filter) {
    return res.status(400).send({ message: 'You must provide id to update a user' });
  }

  const user = await User.findOneAndUpdate(filter, req.body, {
    new: true,
    runValidators: true, // Run model validations
  });

  if (!user) return res.status(404).send({ message: 'User not found' });
  // Return the updated user
  res.status(200).json({ message: 'User updated successfully', user });
};
