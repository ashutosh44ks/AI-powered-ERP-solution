import logger from "../config/logger.js";

export const morganStream = {
  // The 'write' method is what Morgan will call to log each request
  write: (message: string) => {
    // Winston will receive this message and log it as an 'info' level log
    // We use .trim() to remove the trailing newline added by Morgan
    logger.info(message.trim());
  },
};
