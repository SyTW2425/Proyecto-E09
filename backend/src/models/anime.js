import mongoose from 'mongoose';

// Submodelo para imÃ¡genes de anime
const ImageSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    facet: { type: String, required: true },
    path: { type: String, required: true },
    link: { type: String, required: true },
});

// Submodelo para audio de los videos
const AudioSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    basename: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    link: { type: String, required: true },
});

// Submodelo para videos dentro de entradas de temas de anime
const VideoSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    basename: { type: String, required: true },
    filename: { type: String, required: true },
    lyrics: { type: Boolean, required: true },
    nc: { type: Boolean, required: true },
    overlap: { type: String, required: true },
    path: { type: String, required: true },
    resolution: { type: Number, required: true },
    size: { type: Number, required: true },
    source: { type: String, required: true },
    subbed: { type: Boolean, required: true },
    uncen: { type: Boolean, required: true },
    tags: { type: String, required: false },
    link: { type: String, required: true },
    audio: { type: AudioSchema, required: true },
});

// Submodelo para entradas de temas de anime
const AnimeThemeEntrySchema = new mongoose.Schema({
    id: { type: Number, required: true },
    episodes: { type: String, required: true },
    notes: { type: String, required: false },
    nsfw: { type: Boolean, required: true },
    spoiler: { type: Boolean, required: true },
    version: { type: String, required: false },
    videos: { type: [VideoSchema], required: true },
});

// Submodelo para artistas de canciones
const ArtistSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    alias: { type: String, required: false },
    as: { type: String, required: false },
});

// Submodelo para canciones
const SongSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    artists: { type: [ArtistSchema], required: true },
});

// Submodelo para anime
const AnimeSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    media_format: { type: String, required: true },
    season: { type: String, required: true },
    slug: { type: String, required: true },
    synopsis: { type: String, required: false },
    year: { type: Number, required: true },
    images: { type: [ImageSchema], required: true },
});

// Modelo principal para temas de anime
const AnimeThemeSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    sequence: { type: String, required: false },
    slug: { type: String, required: true },
    type: { type: String, required: true },
    anime: { type: AnimeSchema, required: true },
    animethemeentries: { type: [AnimeThemeEntrySchema], required: true },
    group: { type: String, required: false },
    song: { type: SongSchema, required: true },
});

export default mongoose.model('AnimeTheme', AnimeThemeSchema);