import { FeedPost } from "src/feed/models/post.interface";
import { IsEmail, IsString } from "class-validator";
import { Role } from "./role.enum";

export class User {
    id?: number;
    firstName?: string;
    lastName?: string;
    @IsEmail()
    email?: string;
    @IsString()
    password?: string;
    imagePath?: string;
    role?: Role;
    posts?: FeedPost[];
}