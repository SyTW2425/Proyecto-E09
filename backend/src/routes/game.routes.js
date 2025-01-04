import { Router } from 'express';

import * as gameController from '../controllers/game.controller.js';
import { authJwt, validator } from '../middlewares/index.js';

export const gameRouter = Router();

gameRouter.post('/', gameController.createGame, async (req, res) => {
});

gameRouter.patch('/answer', gameController.checkAnswer, async (req, res) => { // Route to check user's answer
});

gameRouter.get('/:gameId', gameController.getGameCurrentInfo, async (req, res) => {
});

gameRouter.delete('/:gameId', gameController.deleteGame, async (req, res) => {
});

export default gameRouter;