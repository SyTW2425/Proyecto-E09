import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  permissions: {
    type: [String],
    required: true
  }
});