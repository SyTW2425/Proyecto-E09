import mongoose from 'mongoose';

// Modelo principal para temas de anime
const AnimeThemeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // Imagenes de la portada del anime
    images: [{
        type: String,
        required: true
    }],
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
});

const AnimeTheme = mongoose.model('AnimeTheme', AnimeThemeSchema);

export default AnimeTheme;