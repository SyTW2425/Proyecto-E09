import User from '../models/user.js';

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({message: 'User created successfully', user});
  } catch (error) {
    res.status(500).send(error);
  }
}

export const deleteById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `User with ID ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getUser = async (req, res) => {
  try {
		const { id, username, email } = req.query; // Get query parameters
    console.log(req.query);
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
	} catch (error) {
		res.status(500).send({ message: 'Error fetching users', error });
	}
}

export const updateUser = async (req, res) => {
  try {
    const { id, username, email } = req.query;

    let filter = null;
    // Determine the filter to use
    if (id) {
      filter = { _id: id };
    } else if (username) {
      filter = { username: username };
    } else if (email) {
      filter = { email: email };
    }

    // If no filter is provided, return an error
    if (!filter) {
      return res.status(400).send({ message: 'You must provide id, username, or email to update a user' });
    }

    const user = await User.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true, // Run model validations
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Return the updated user
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error updating user', error });
  }
};
