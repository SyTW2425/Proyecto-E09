import mongoose from 'mongoose';
import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, startServer } from '../src/app.js';
import Game from '../src/models/game.js';

const request = supertest(app);
let mongoServer;
let gameId;
let gameId2;

// Configure MongoDB Memory Server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  startServer();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Clean the database after each test
afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('POST /game', () => {
  it('should create a new game', async () => {
    const res = await request
      .post('/game')
      .send({
        rounds: 5
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('gameId');
    expect(res.body).toHaveProperty('rounds');
    gameId = res.body.gameId;
  });

  it('should create a game with a range of years', async () => {
    const res = await request
      .post('/game')
      .send({
        rounds: 5,
        b_year: 2000,
        f_year: 2010
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('gameId');
    expect(res.body).toHaveProperty('rounds');
  });

  it('should create a game with f_year only', async () => {
    const res = await request
      .post('/game')
      .send({
        rounds: 5,
        f_year: 2010
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('gameId');
    expect(res.body).toHaveProperty('rounds');
  });

  it('should create a game with b_year only', async () => {
    const res = await request
      .post('/game')
      .send({
        rounds: 5,
        b_year: 2000
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('gameId');
    expect(res.body).toHaveProperty('rounds');
  });

  it('should return 400 if b_year is greater than f_year', async () => {
    const res = await request
      .post('/game')
      .send({
        rounds: 5,
        b_year: 20000,
        f_year: 2010
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not create a game without rounds', async () => {
    const res = await request
      .post('/game')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('PATCH /game/answer', () => {
  beforeEach(async () => {
    const newGame = new Game({
      rounds: 3,
      animes: [
        { name: 'Anime1', images: ['image1.jpg'], songName: 'Song1', video: 'video1.mp4', audio: 'audio1.mp3' },
        { name: 'Anime2', images: ['image2.jpg'], songName: 'Song2', video: 'video2.mp4', audio: 'audio2.mp3' },
      ]
    });
    const game = await newGame.save();
    gameId = game._id;

    const newGame2 = new Game({
      rounds: 1,
      animes: [
        { name: 'My Hero Academia', images: ['image3.jpg'], songName: 'Song3', video: 'video3.mp4', audio: 'audio3.mp3' },
      ]
    });
    const game2 = await newGame2.save();
    gameId2 = game2._id;
  });

  it('should check the correct answer', async () => {
    const res = await request
      .patch('/game/answer')
      .send({
        gameId,
        userAnswer: 'Anime1'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Correct answer');
    expect(res.body).toHaveProperty('correct', true);
  });

  
  it('should check an incorrect answer', async () => {
    const res = await request
    .patch('/game/answer')
    .send({
      gameId,
      userAnswer: 'AnimeX'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Incorrect answer');
    expect(res.body).toHaveProperty('correct', false);
  });

  it('should check a similar answer', async () => {
    const res = await request
      .patch('/game/answer')
      .send({
        gameId: gameId2,
        userAnswer: 'my hero acedemia'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Correct answer');
    expect(res.body).toHaveProperty('correct', true);
  });
  
  it('should return 400 if missing gameId or userAnswer', async () => {
    const res = await request
      .patch('/game/answer')
      .send({
        userAnswer: 'Anime1'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /game/:gameId', () => {
  beforeEach(async () => {
    const newGame = new Game({
      rounds: 5,
      animes: [
        { name: 'Anime1', images: ['image1.jpg'], songName: 'Song1', video: 'video1.mp4', audio: 'audio1.mp3' }
      ]
    });
    const game = await newGame.save();
    gameId = game._id;
  });

  it('should get the current game info', async () => {
    const res = await request
      .get(`/game/${gameId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('currentRound');
    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('anime');
    expect(res.body).toHaveProperty('rounds');
  });

  it('should return 500 if game not found', async () => {
    const res = await request
      .get('/game/invalidGameId');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error getting game');
  });
});

describe('DELETE /game/:gameId', () => {
  beforeEach(async () => {
    const newGame = new Game({
      rounds: 5,
      animes: [
        { name: 'Anime1', images: ['image1.jpg'], songName: 'Song1', video: 'video1.mp4', audio: 'audio1.mp3' }
      ]
    });
    const game = await newGame.save();
    gameId = game._id;
  });

  it('should delete a game', async () => {
    const res = await request
      .delete(`/game/${gameId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Game deleted');
  });

  it('should return 500 if game not found', async () => {
    const res = await request
      .delete('/game/invalidGameId');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Error deleting game');
  });
});
