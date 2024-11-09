import { Schema, model } from 'mongoose';

const LeaderboardSchema = new Schema({
	player: { type: String, required: true },
	wins: { type: Number, required: true },
	games: { type: Number, required: true }
});

export const Leaderboard = model('Leaderboard', LeaderboardSchema);