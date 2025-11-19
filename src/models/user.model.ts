import { z } from "zod";
import bcrypt from "bcryptjs";

// User role enum
export enum UserRole {
  STUDENT = "student",
  COLLEGE = "college",
  COMPANY = "company"
}

// Zod schema for user validation
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole)
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional()
});

// TypeScript type inferred from Zod schema
export type User = z.infer<typeof userSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// In-memory user store (replace with database in production)
class UserStore {
  private users: Map<string, User> = new Map();

  async create(data: RegisterUserInput): Promise<User> {
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user: User = {
      id,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(id, user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async update(id: string, data: UpdateUserInput): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

export const userStore = new UserStore();
