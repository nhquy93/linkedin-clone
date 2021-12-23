import { Post } from "src/app/home/models/Post";

export type Role = 'admin' | 'premium' | 'user';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    imagePath?: string;
    role: Role;
    posts?: Post[];
}