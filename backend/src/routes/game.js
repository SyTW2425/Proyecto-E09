import 'dotenv/config';
import { Router } from 'express';
import { Game } from '../models';

export const gameRouter = Router();

gameRouter.post('/game', async (req, res) => {
	try {
		const game = new Game(req.body);
		await game.save();
		res.status(201).send(game);
	} catch (error) {
		res.status(400).send(error);
	}	
});