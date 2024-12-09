import { Router } from 'express';

import * as gameController from '../controllers/game.controller.js';
import { authJwt, validator } from '../middlewares/index.js';

export const gameRouter = Router();

gameRouter.post('/', gameController.createGame, async (req, res) => {
  res.send('Create game route');
});

gameRouter.patch('/answer', [authJwt.verifyToken], gameController.checkAnswer, async (req, res) => {
  res.send('Check answer route');
});

gameRouter.get('/:gameId', [authJwt.verifyToken], gameController.getGameCurrentInfo, async (req, res) => {
  res.send('Get game current info route');
});

export default gameRouter;