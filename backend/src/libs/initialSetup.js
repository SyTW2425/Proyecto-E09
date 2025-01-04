import Role from '../models/role.js';

export const createRoles = async () => {
  const values = await Promise.all([
    new Role({ name: 'user' }).save(),
    new Role({ name: 'moderator' }).save(),
    new Role({ name: 'admin' }).save()
  ]);
}