import { Schema, model } from 'mongoose';

const GameSchema = new Schema({
	rounds: { type: Number, required: true },
	playerNum: { type: Number, required: true },
	players: { type: Array, required: true },
	winner: { type: String, required: false },
	createdAt: { type: Date, required: true },
	done: { type: Boolean, required: true },
});

export const Game = model('Game', GameSchema);