import 'dotenv/config';
import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
    res.send('Login route');
    }
);

authRouter.post('/register', (req, res) => {
    res.send('Register route');
    }
);

export default authRouter;