import express from 'express';
import './db/mongoose.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';

import { createRoles } from './libs/initialSetup.js';

import 'dotenv/config';

export const app = express();
createRoles();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/auth', authRouter);
app.use('/api', userRouter);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});