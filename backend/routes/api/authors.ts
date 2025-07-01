import express, { Request, Response, NextFunction, Router } from "express";
import { clerkClient, getAuth } from "@clerk/express";

import {
   paginate,
   getUserFromClerk,
   buildSearchQuery,
   PaginationOptions
} from "../../utils/helpers";

const router: Router = express.Router();

// GET /api/authors/ - get all authors
router.get("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const { data } = await clerkClient.users.getUserList();
      // Filter only relevant fields
      const authors = data.map(user => ({
         id: user.id,
         firstName: user.firstName,
         lastName: user.lastName,
         imageUrl: user.imageUrl,
         email: user.emailAddresses[0]?.emailAddress,
         username: user.username,
         createdAt: user.createdAt,
      }));
      res.json({ success: true, data: authors });
   } catch (err) {
      next(err);
   }
});

// GET /api/authors/:authorId - get documents by specific author (including current user)
router.get("/:authorId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const { authorId } = req.params;
      const { userId } = getAuth(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const search = req.query.search as string;

      // If user is viewing their own documents, show all (public + private)
      // If viewing someone else's, only show public
      const isOwnProfile = userId === authorId;
      const query = buildSearchQuery(search, authorId, isOwnProfile ? undefined : true);
      const options: PaginationOptions = { page, limit };

      const result = await paginate(query, options);

      // Get author info from Clerk
      let authorInfo = null;
      try {
         authorInfo = await getUserFromClerk(authorId);
      } catch (error) {
         res.status(404).json({
            success: false,
            message: "Author not found"
         });
         return;
      }

      res.json({
         success: true,
         author: authorInfo,
         isOwnProfile,
         ...result
      });
   } catch (error) {
      next(error);
   }
});

// GET /api/authors/info/:authorId - Get author info
router.get("/:authorId/info", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const { authorId } = req.params;
      const authorInfo = await getUserFromClerk(authorId);
      
      res.json({
         success: true,
         data: authorInfo
      });
   } catch (error) {
      next(error);
   }
});

export default router;