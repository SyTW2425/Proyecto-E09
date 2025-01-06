import mongoose, { Schema } from 'mongoose';

export const ROLES = ["user", "admin", "moderator"];

/**
 * Role schema
 */
const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ROLES
  },
  permissions: {
    type: [String],
    required: true
  }
});

const Role = mongoose.model('Role', roleSchema);

export default Role;