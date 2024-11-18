import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { authJwt, validator } from '../middlewares/index.js';

export const authRouter = Router();

authRouter.post('/login', authController.login, (req, res) => {
    res.send('Login route');
    }
);

authRouter.post('/register', authController.register, (req, res) => {
    res.send('Register route');
    }
);

export default authRouter;