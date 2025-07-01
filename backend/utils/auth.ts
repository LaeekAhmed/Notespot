import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";

// Custom middleware to check authentication and return 401 if not authenticated
export const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
   const { userId } = getAuth(req);
   
   // Check if user is properly authenticated with Clerk
   if (!userId) {
      res.status(401).json({
         success: false,
         error: 'Unauthorized'
      });
      return;
   }
   next();
}; 