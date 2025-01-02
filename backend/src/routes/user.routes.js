import { Router } from 'express';

import User from '../models/user.js';

import * as userController from '../controllers/user.controller.js';
import { authJwt, validator } from '../middlewares/index.js';

export const userRouter = Router();

userRouter.get('/user', userController.getUser, async (req, res) => {
  console.log(req.query);
  res.send('Get user route');
});

userRouter.get('/user/:username', userController.getUser, async (req, res) => {
  res.send('Get user by username route');
});

userRouter.post('/user', [authJwt.verifyToken, authJwt.isAdmin, validator.checkDuplicateUsernameOrEmail, validator.checkRolesExisted],
  userController.createUser, async (req, res) => {
  res.send('Create user route');
});

userRouter.delete('/user/:id', userController.deleteById, async (req, res) => {
  res.send(`User with ID ${req.params.id} deleted`);
});

userRouter.patch('/user', [[authJwt.verifyToken, authJwt.isModerator, validator.checkDuplicateUsernameOrEmail, validator.checkRolesExisted]], 
  userController.updateUser, async (req, res) => {
  res.send('Update user route');
});

export default userRouter;