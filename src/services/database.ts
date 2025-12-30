import mongoose from "mongoose";

const DB_CONFIG = {
  CONNECTION_TIMEOUT: 10000,
};

/**
 * Builds MongoDB connection URI from separate environment variables
 * @returns {string} Complete MongoDB connection URI
 * @throws {Error} If required environment variables are missing
 */

const buildMongoURI = (): string => {
  const {
    MONGO_PROTOCOL: protocol = "mongodb+srv",
    MONGO_USERNAME: username,
    MONGO_PWD: password,
    MONGO_URI: host,
    MONGO_DB: database,
  } = process.env;

  // Validate required variables
  if (!username) {
    throw new Error("MONGO_USERNAME environment variable is not defined");
  }
  if (!password) {
    throw new Error("MONGO_PWD environment variable is not defined");
  }
  if (!host) {
    throw new Error("MONGO_URI environment variable is not defined");
  }
  if (!database) {
    throw new Error("MONGO_DB environment variable is not defined");
  }

  // Construct and return the URI
  return `${protocol}://${username}:${encodeURIComponent(
    password
  )}@${host}/${database}`;
};

// ============================================================================
// DATABASE SERVICE
// ============================================================================

/**
 * Singleton service for managing MongoDB database connections
 */
class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Connect to MongoDB database
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("✓ Database already connected");
      return;
    }

    try {
      const mongoUri = buildMongoURI();

      await mongoose.connect(mongoUri, {
        connectTimeoutMS: DB_CONFIG.CONNECTION_TIMEOUT,
        serverSelectionTimeoutMS: DB_CONFIG.CONNECTION_TIMEOUT,
      });

      this.isConnected = true;
      console.log("✓ Database connected successfully");
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("✗ Database connection failed:", errorMessage);
      console.error("✗ Terminating process due to database connection failure");
      process.kill(process.pid, "SIGTERM");
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB database
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("✓ Database disconnected successfully");
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("✗ Database disconnection failed:", errorMessage);
      console.error(
        "✗ Terminating process due to database disconnection error"
      );
      process.kill(process.pid, "SIGTERM");
      process.exit(1);
    }
  }

  /**
   * Get current database connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default DatabaseService;
