import mongoose, { Schema } from 'mongoose'; // Asegúrate de importar mongoose de forma correcta
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  roles: [{
    ref: "role",
    type: Schema.Types.ObjectId
  }],
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  }
});

// Métodos para encriptar y comparar contraseñas
userSchema.statics.encryptPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

userSchema.statics.comparePassword = async (password, receivedPassword) => {
  return await bcrypt.compare(password, receivedPassword);
};

// Define el modelo User
const User = mongoose.model('User', userSchema);

// Exporta el modelo User utilizando la sintaxis de ES Modules
export default User;
