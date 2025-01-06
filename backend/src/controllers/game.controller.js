import axios from 'axios';
import stringSimilarity from 'string-similarity';

import Game from '../models/game.js';
import User from '../models/user.js';

/**
 * Get relevant information from the API response
 * @param {Array} animethemes - Array of animethemes objects: { anime, song, animethemeentries }
 * @returns {Array} - Array of relevant information objects: { name, images, songName, video, audio }
 */
function getRelevantInfo(animethemes) {
  let listAnimeInfo = [];
  animethemes.forEach((animeInfo) => {
    const { anime, song, animethemeentries } = animeInfo;
    const { images } = anime;
    const { videos } = animethemeentries[0];
    animeInfo = {
      name: anime.name,
      images: images.map(image => image.link),
      songName: song.title,
      video: videos[0].link,
      audio: videos[0].audio.link
    };
    listAnimeInfo.push(animeInfo);
  })
  return listAnimeInfo;
}

/**
 * Create a new game
 * @param {Object} req - Request object: rounds, b_year, f_year
 * @param {Number} req.rounds - Number of rounds
 * @param {Number} req.b_year - Beginning year
 * @param {Number} req.f_year - Final year
 * @param {Object} res - Response object
 * @returns {Object} - Response object with the game id and rounds
 * @throws {Object} - Response object with the error message
 * @async
 */
export const createGame = async (req, res) => {
  const { rounds, b_year, f_year } = req.body;
  if (!rounds) return res.status(400).send({ message: 'Rounds is required' });

  const url = 'https://api.animethemes.moe/animetheme'; 
  const params = {
    'page[size]': rounds,
    'page[number]': 1,
    'filter[has]': 'anime,animethemeentries',
    'filter[spoiler]': false,
    'filter[nsfw]': false,
    'filter[type]': 'OP',
    'filter[anime][media_format]': 'TV',
    sort: 'random',
    include: 'group,anime.images,song.artists,animethemeentries.videos.audio',
  };

  if (b_year) params['filter[year-gte]'] = b_year;    // Greater than or equal year
  if (f_year) params['filter[year-lte]'] = f_year;    // Less than or equal year
  if ((b_year && f_year) && (b_year > f_year)) return res.status(400).send({ message: 'Invalid years range' });

  const response = await axios.get(url, { params });  // Get data from the API
  const animethemes = response.data;
  const relevantInfo = getRelevantInfo(animethemes.animethemes);
  const newGame = new Game({ rounds: relevantInfo.length, animes: relevantInfo });
  const game = await newGame.save();
  return res.status(200).json({ gameId: game._id, rounds: game.rounds });
}

/**
 * Give experience to the user
 * @param {Number} score - Number of correct answers
 * @param {Number} rounds - Number of rounds
 * @param {Object} user - User object
 * @param {String} user.username - User username
 * @param {Number} user.experience - User experience
 * @param {Number} user.level - User level
 * @returns {Promise} - Promise object represents the user with updated experience and level
 * @async
 * @throws {Error} - User not found
 */
export const giveExperience = async (score, rounds, user) => {
  if (!user) throw new Error('User not found');
  const experience = Math.floor((score / rounds) * 100 * rounds);
  user.experience += experience;
  while (user.experience >= 1000) {
    user.level += 1;
    user.experience -= 1000;
  }
  await user.save();
};

/**
 * Check if the answer is correct
 * @param {Object} req - Request object: gameId, userAnswer, username
 * @param {String} req.gameId - Game id
 * @param {String} req.userAnswer - User answer
 * @param {String} req.username - User username
 * @param {Object} res - Response object
 * @returns {Object} - Response object with the message and correct answer
 * @throws {Object} - Response object with the error message
 * @async
 */
export const checkAnswer = async (req, res) => {
  const { gameId, userAnswer, username } = req.body;

  if (!gameId || !userAnswer) {
    return res.status(400).json({ error: 'Faltan datos necesarios.' });
  }

  const game = await Game.findById(gameId);
  const correctAnswer = game.animes[game.currentRound - 1].name;
                                            // Text normalization
  const normalizeText = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const isCorrect = normalizeText(userAnswer) === normalizeText(correctAnswer);

                                            // Secondary check with string similarity
  const similarity = stringSimilarity.compareTwoStrings(userAnswer.toLowerCase(), correctAnswer.toLowerCase());
  const isSimilar = similarity > 0.80;      // 80% similarity threshold

  const correct = isCorrect || isSimilar ? true : false;
  game.currentRound += 1;
  game.score += correct ? 1 : 0;
  if (game.currentRound === game.rounds) {  // Last round and grant experience
    const user = await User.findOne().where('username').equals(username);
    giveExperience(game.score, game.rounds, user);
  }
  await game.save();
  return res.status(200).send({ message: correct ? 'Correct answer' : 'Incorrect answer', correct });
}

/**
 * Get the current game information
 * @param {Object} req - Request object: gameId
 * @param {String} req.params.gameId - Game id
 * @param {Object} res - Response object
 * @returns {Object} - Response object with the current game information
 * @throws {Object} - Response object with the error message
 * @async
 * @uses Game to get the next round
 */
export const getGameCurrentInfo = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).send({ message: 'Game not found' });
    const currentInfo = {
      currentRound: game.currentRound,
      score: game.score,
      anime: game.animes[game.currentRound - 1],
      rounds: game.rounds
    }
    return res.status(200).json(currentInfo);
  }
  catch (error) {
    res.status(500).send({ message: 'Error getting game', error });
  }
}

/**
 * Delete a game
 * @param {Object} req - Request object: gameId
 * @param {String} req.params.gameId - Game id
 * @param {Object} res - Response object
 * @returns {Object} - Response object with the message
 * @throws {Object} - Response object with the error message
 * @async
 */
export const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findByIdAndDelete(gameId);
    if (!game) return res.status(404).send({ message: 'Game not found' });
    return res.status(200).send({ message: 'Game deleted' });
  }
  catch (error) {
    res.status(500).send({ message: 'Error deleting game', error });
  }
}
