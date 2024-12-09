import mongoose, { Schema } from 'mongoose';

const gameSchema = new Schema({
    currentRound: {
        type: Number,
        default: 1
    },
    rounds: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    animes: [{
        type: Schema.Types.ObjectId,
        ref: 'AnimeTheme'
    }],
    createdAt : {
        type: Date,
        default: Date.now
    }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
