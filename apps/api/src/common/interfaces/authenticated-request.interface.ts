import { Request } from "express";
import { Role } from "@conozca/database";

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: Role;
  };
}
