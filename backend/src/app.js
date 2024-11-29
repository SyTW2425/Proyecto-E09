import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import cors from 'cors';

import './db/mongoose.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import { createRoles } from './libs/initialSetup.js';
import { connectDB, closeDB } from './db/mongoose.js';


export const app = express();
app.use(cookieParser());
app.use(cors());

app.use(express.json());
app.use('/auth', authRouter);
app.use('/api', userRouter);

const server = http.createServer(app);

export const startServer = async () => {
  await connectDB();
  await createRoles();
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
	return server;
};
startServer();

process.on('SIGINT', async () => {
	await closeDB();
	await server.close();
});