import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import cors from 'cors';

import './db/mongoose.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import gameRouter from './routes/game.routes.js';
import { createRoles } from './libs/initialSetup.js';
import { connectDB, closeDB } from './db/mongoose.js';

export const app = express();
app.use(cookieParser());

const corsOptions ={
	origin:'http://10.6.128.240', 
	credentials:true,            //access-control-allow-credentials:true
	optionSuccessStatus:200,
}


app.use(cors(corsOptions));

app.use(express.json());
app.use('/auth', authRouter);
app.use('/api', userRouter);
app.use('/game', gameRouter);

const server = http.createServer(app);

export const startServer = async () => {
	if (process.env.NODE_ENV !== 'test') {
		await connectDB();
		const port = process.env.PORT || 3000;
		server.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});
	}
	await createRoles();
	return server;
};

startServer();

process.on('SIGINT', async () => {
	await closeDB();
	await server.close();
});
