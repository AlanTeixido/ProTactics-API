import mongoose from 'mongoose';

const entrenadorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // Puedes añadir más campos si quieres: deporte, nivel, club asociado, etc.
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

const Entrenador = mongoose.model('Entrenador', entrenadorSchema);

export default Entrenador;
