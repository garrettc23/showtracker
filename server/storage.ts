import { users, shows, type User, type InsertUser, type Show, type InsertShow, type UpdateShow } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getShowsByUser(userId: number): Promise<Show[]>;
  createShow(show: InsertShow & { imageUrl?: string }): Promise<Show>;
  updateShow(show: UpdateShow): Promise<Show>;
  deleteShow(id: number, userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private shows: Map<number, Show>;
  private currentUserId: number;
  private currentShowId: number;

  constructor() {
    this.users = new Map();
    this.shows = new Map();
    this.currentUserId = 1;
    this.currentShowId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getShowsByUser(userId: number): Promise<Show[]> {
    return Array.from(this.shows.values()).filter(
      (show) => show.userId === userId,
    );
  }

  async createShow(showData: InsertShow & { imageUrl?: string }): Promise<Show> {
    const id = this.currentShowId++;
    const show: Show = {
      ...showData,
      id,
      imageUrl: showData.imageUrl || null,
      createdAt: new Date(),
      completedAt: showData.status === 'completed' ? new Date() : null,
    };
    this.shows.set(id, show);
    return show;
  }

  async updateShow(updateData: UpdateShow): Promise<Show> {
    const existingShow = this.shows.get(updateData.id);
    if (!existingShow) {
      throw new Error('Show not found');
    }
    
    const updatedShow: Show = {
      ...existingShow,
      status: updateData.status,
      completedAt: updateData.status === 'completed' ? new Date() : 
                   updateData.status === 'watching' ? null : existingShow.completedAt,
    };
    
    this.shows.set(updateData.id, updatedShow);
    return updatedShow;
  }

  async deleteShow(id: number, userId: number): Promise<void> {
    const show = this.shows.get(id);
    if (show && show.userId === userId) {
      this.shows.delete(id);
    }
  }
}

export const storage = new MemStorage();
