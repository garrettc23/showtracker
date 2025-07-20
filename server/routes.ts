import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { imageService } from "./services/imageService";
import { insertUserSchema, insertShowSchema, updateShowSchema } from "@shared/schema";

// Extend session types
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Check if username exists
  app.post("/api/auth/check-user", async (req, res) => {
    try {
      const { username } = insertUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      res.json({ 
        exists: !!user,
        user: user || null
      });
    } catch (error) {
      console.error("User check error:", error);
      res.status(400).json({ message: "Invalid username" });
    }
  });

  // Create new user
  app.post("/api/auth/create-user", async (req, res) => {
    try {
      const { username } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser({ username });
      req.session.userId = user.id;
      
      res.json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  // Login existing user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username } = insertUserSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      req.session.userId = user.id;
      
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid username" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Shows routes
  app.get("/api/shows", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const shows = await storage.getShowsByUser(userId);
      res.json(shows);
    } catch (error) {
      console.error("Error fetching shows:", error);
      res.status(500).json({ message: "Failed to fetch shows" });
    }
  });

  app.post("/api/shows", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const showData = insertShowSchema.parse({
        ...req.body,
        userId,
      });

      // Fetch image for the show (always succeeds with fallback)
      let imageUrl;
      try {
        imageUrl = await imageService.fetchShowImage(showData.title);
      } catch (error) {
        console.error("Image fetch error:", error);
        // Use TiVo logo fallback if image fetch fails completely
        imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjUwIiB5PSIyNTAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIiByeD0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPHN2ZyB4PSIxNzUiIHk9IjI3NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHA+VFY8L3A+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjQwMCIgZmlsbD0iIzhCNUM4QyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
      }

      const show = await storage.createShow({
        ...showData,
        imageUrl,
      });

      res.json(show);
    } catch (error) {
      console.error("Error creating show:", error);
      res.status(400).json({ message: "Failed to create show" });
    }
  });

  app.patch("/api/shows/:id", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      const updateData = updateShowSchema.parse({
        ...req.body,
        id,
      });

      const show = await storage.updateShow(updateData);
      res.json(show);
    } catch (error) {
      console.error("Error updating show:", error);
      res.status(400).json({ message: "Failed to update show" });
    }
  });

  app.delete("/api/shows/:id", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      await storage.deleteShow(id, userId);
      res.json({ message: "Show deleted successfully" });
    } catch (error) {
      console.error("Error deleting show:", error);
      res.status(400).json({ message: "Failed to delete show" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
