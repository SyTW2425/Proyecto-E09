import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { authJwt, validator } from '../middlewares/index.js';

export const authRouter = Router();

authRouter.post('/login', authController.login, (req, res) => {
}
);

authRouter.post('/register', [validator.checkDuplicateUsernameOrEmail, validator.checkRolesExisted], authController.register, (req, res) => {
}
);

export default authRouter;