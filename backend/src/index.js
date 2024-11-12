import express from 'express';
import authRouter from './routes/auth.routes.js';

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/login', authRouter);
app.use('/register', authRouter);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});