// express.d.ts
// This is the most reliable way to extend the Request object.
import { Request } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    USER_ID?: string;
  }
}