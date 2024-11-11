import 'dotenv/config';
import { Router } from 'express';

import * as authController from '../controllers/auth.controller';
import { authJwt, validator } from '../middlewares';

export const authRouter = Router();

authRouter.post('/login', authController.login, (req, res) => {
    res.send('Login route');
    }
);

authRouter.post('/register', [validator.checkDuplicateUsernameOrEmail, validator.checkRolesExisted], authController.register, (req, res) => {
    res.send('Register route');
    }
);

export default authRouter;