import axios from 'axios';
import stringSimilarity from 'string-similarity';

import Game from '../models/game.js';

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

export const createGame = async (req, res) => {
  try {
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

    if (b_year) params['filter[year-gte]'] = b_year;
    if (f_year) params['filter[year-lte]'] = f_year;
    if ((b_year && f_year) && (b_year > f_year)) return res.status(400).send({ message: 'Invalid years range' });

    const response = await axios.get(url, { params });
    const animethemes = response.data;
    const relevantInfo = getRelevantInfo(animethemes.animethemes);
    const newGame = new Game({ rounds: relevantInfo.length, animes: relevantInfo });
    const game = await newGame.save();
    return res.status(200).json({ gameId: game._id, rounds: game.rounds });
  } catch (error) {
    res.status(500).send({ message: 'Error creating game', error });
  }
}

export const checkAnswer = async (req, res) => {
  try {
    const { gameId, userAnswer } = req.body;

    if (!gameId || !userAnswer) {
      return res.status(400).json({ error: 'Faltan datos necesarios.' });
    }

    const game = await Game.findById(gameId);

    const correctAnswer = game.animes[game.currentRound - 1].name;
    // Normalización básica de texto
    const normalizeText = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const isCorrect = normalizeText(userAnswer) === normalizeText(correctAnswer);

    // Validación secundaria usando similitud de cadenas
    const similarity = stringSimilarity.compareTwoStrings(userAnswer.toLowerCase(), correctAnswer.toLowerCase());
    const isSimilar = similarity > 0.80; // Umbral de 80% de similitud

    const correct = isCorrect || isSimilar ? true : false;
    if (correct) {
      game.score += 1;
      game.currentRound += 1;
      await game.save();
      return res.status(200).send({ message: 'Correct answer', correct });
    } else {
      game.currentRound += 1;
      await game.save();
      return res.status(200).send({ message: 'Incorrect answer', correct });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error checking answer', error });
  }
}

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
