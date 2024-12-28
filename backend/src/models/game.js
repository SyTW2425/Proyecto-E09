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
        // Nombre del anime
        name: {
            type: String,
            required: true
        },
        // Imagenes de la portada del anime
        images: [{
            type: String,
            required: true
        }],
        // Nombre de la canción
        songName: {
            type: String,
        },
        // Video de la canción
        video: {
            type: String,
            required: true
        },
        // Audio de la canción
        audio: {
            type: String,
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
