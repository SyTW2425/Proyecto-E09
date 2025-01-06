import { Router } from 'express';

import User from '../models/user.js';

import * as userController from '../controllers/user.controller.js';
import { authJwt, validator } from '../middlewares/index.js';

export const userRouter = Router();

userRouter.get('/user', [authJwt.verifyToken, authJwt.isAdmin], userController.getUser, async (req, res) => {
});

userRouter.get('/user/:username', [authJwt.verifyToken, authJwt.isMySelfOrModerator], userController.getUserByUsername, async (req, res) => {
});

userRouter.post('/user', [authJwt.verifyToken, authJwt.isAdmin, validator.checkDuplicateUsernameOrEmail, validator.checkRolesExisted],
  userController.createUser, async (req, res) => {
  });

userRouter.delete('/user/:id', [authJwt.verifyToken, authJwt.isAdmin], userController.deleteById, async (req, res) => {
});

userRouter.patch('/user', [authJwt.verifyToken, authJwt.isModerator, validator.checkRolesExisted],
  userController.updateUser, async (req, res) => {
  });

export default userRouter;