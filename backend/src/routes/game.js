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

gameRouter.get('/game', async (req, res) => {
	try {
		const games = await Game.find({});
		res.send(games);
	} catch (error) {
		res.status(500).send();
	}
});

gameRouter.get('/game/:id', async (req, res) => {
	try {
		const game = await Game.findById(req.params.id);
		if (!game) {
			return res.status(404).send();
		}
		res.send(game);
	} catch (error) {
		res.status(500).send();
	}
});

gameRouter.patch('/game/:id', async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['winner', 'done'];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}

	try {
		const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!game) {
			return res.status(404).send();
		}
		res.send(game);
	} catch (error) {
		res.status(400).send(error);
	}
});

gameRouter.delete('/game/:id', async (req, res) => {
	try {
		const game = await Game.findByIdAndDelete(req.params.id);
		if (!game) {
			return res.status(404).send();
		}
		res.send(game);
	} catch (error) {
		res.status(500).send();
	}
});


gameRouter.get('/game/player/:player', async (req, res) => {
	try {
		const games = await Game.find({ players: req.params.player });
		if (!games) {
			return res.status(404).send();
		}
		res.send(games);
	} catch (error) {
		res.status(500).send();
	}
});

export default gameRouter;