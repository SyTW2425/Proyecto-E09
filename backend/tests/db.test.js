import { connectDB, closeDB } from '../src/db/mongoose.js';
import mongoose from 'mongoose';

jest.mock('mongoose');

jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(process, 'exit').mockImplementation(() => {});  

describe('Database connection', () => {
  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('should connect to the database', async () => {
    mongoose.connect.mockResolvedValueOnce(true);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.ATLAS_URI);
    expect(console.log).toHaveBeenCalledWith('DB is connected');
  });

  it('should handle connection errors', async () => {
    const errorMessage = 'Connection error';
    mongoose.connect.mockRejectedValueOnce(new Error(errorMessage));

    await connectDB();
    expect(console.error).toHaveBeenCalledWith('Database connection error:', errorMessage);
    expect(process.exit).toHaveBeenCalledWith(1); 
  });

  it('should close the database connection', async () => {
    mongoose.connection = {
      close: jest.fn().mockResolvedValueOnce(true), 
    };

    await closeDB();

    expect(mongoose.connection.close).toHaveBeenCalled();
  });

  it('should handle disconnection errors', async () => {
    const errorMessage = 'Disconnection error';
    mongoose.connection = {
      close: jest.fn().mockRejectedValueOnce(new Error(errorMessage)), 
    };

    await closeDB();
    expect(console.error).toHaveBeenCalledWith('Database disconnection error:', errorMessage);
    expect(process.exit).toHaveBeenCalledWith(1); 
  });
});
