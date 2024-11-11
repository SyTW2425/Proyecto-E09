import 'dotenv/config';
import { Router } from 'express';
import { User } from '../models';

import * as userController from '../controllers/user.controller';
import { authJwt, validator } from '../middlewares';

export const userRouter = Router();

userRouter.get('/user', async (req, res) => {
	try {
		const users = await User.find({});
		res.send(users);
	} catch (error) {
		res.status(500).send();
	}
});

userRouter.get('/user/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).send();
		}

		res.send(user);
	} catch (error) {
		res.status(500).send();
	}
});

userRouter.get('/user/:username', async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username });
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		res.status(500).send();
	}
});

userRouter.post('/user', [authJwt.verifyToken, authJwt.isAdmin, validator.checkDuplicateUsernameOrEmail, validator.checkRolesExisted],
	            userController.createUser, async (req, res) => {
	try {
		const user = new User(req.body);
		await user.save();
		res.status(201).send(user);
	} catch (error) {
		res.status(500).send(error);
	}
});

userRouter.patch('/user/:id', async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'username', 'email', 'password'];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}

	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		res.status(400).send(error);
	}
});

userRouter.delete('/user/:id', async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		res.status(500).send();
	}
});

export default userRouter;