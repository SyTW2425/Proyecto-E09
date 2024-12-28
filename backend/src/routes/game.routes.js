import { Router } from 'express';

import * as gameController from '../controllers/game.controller.js';
import { authJwt, validator } from '../middlewares/index.js';

export const gameRouter = Router();

gameRouter.post('/', gameController.createGame, async (req, res) => {
  res.send('Create game route');
});

gameRouter.patch('/answer', gameController.checkAnswer, async (req, res) => { // Route to check user's answer
  res.send('Check answer route');
});

gameRouter.get('/:gameId', gameController.getGameCurrentInfo, async (req, res) => {
  res.send('Get game current info route');
});

gameRouter.delete('/:gameId', gameController.deleteGame, async (req, res) => {
  res.send('Delete game route');
});

export default gameRouter;