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
    console.log("Auth check - Session ID:", req.sessionID, "User ID:", userId);
    
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
        imageUrl = 'data:image/svg+xml;base64,' + Buffer.from(`
      <svg width="300" height="450" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="450" fill="#1F2937"/>
        <g transform="translate(150, 225)">
          <g transform="scale(2.5) translate(-50, -25)">
            <path d="M0 0h100v50H0z" fill="#000"/>
            <circle cx="15" cy="15" r="3" fill="#E53E3E"/>
            <circle cx="25" cy="15" r="3" fill="#38A169"/>
            <circle cx="35" cy="15" r="3" fill="#D69E2E"/>
            <circle cx="45" cy="15" r="3" fill="#3182CE"/>
            <path d="M20 25c0 5 5 10 15 10s15-5 15-10" stroke="white" stroke-width="2" fill="none"/>
            <path d="M10 5L10 0M90 5L90 0M10 45L10 50M90 45L90 50" stroke="#000" stroke-width="3"/>
          </g>
        </g>
        <text x="150" y="320" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="14" font-weight="bold">No Image Available</text>
      </svg>
    `).toString('base64');
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
