import mongoose from "mongoose";
import { getLogger } from '../utils/logger.js';

const logger = getLogger();

class MongoDBProvider {
  connection = null;
  static instance;

  constructor() {
    if (MongoDBProvider.instance) {
      return MongoDBProvider.instance;
    }
    MongoDBProvider.instance = this;
  }

  async connect(uri) {
    if (!this.connection) {
      try {
        this.connection = await mongoose.connect(uri, {});
        logger.info("Connected to MongoDB");
      } catch (error) {
        logger.error("Error connecting to MongoDB", error);
        throw error;
      }
    }
    return this.connection;
  }

  getInstance() {
    return this.connection;
  }
}

export const mongodbProvider = new MongoDBProvider();