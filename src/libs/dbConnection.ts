import Logger from '@libs/logger';
import { connect } from 'mongoose';

const connectToDatabase = async () => {
  try {
    const mongoURI: string = process.env.MONGODB_URI as string;
    await connect(mongoURI);
    Logger.info('Database sucessfully connected...');
  } catch (err) {
    Logger.error((err as Error).message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectToDatabase;
