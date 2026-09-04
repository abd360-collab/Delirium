import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { authService } from "./auth.service.js";

export async function register(
  req: Request,
  res: Response,
) {
  
  const input = registerSchema.parse(req.body);

  const user = await authService.register(input);

  return res.status(201).json({
    success: true,
    data: {
      user,
    },
  });
}


export async function login(
  req: Request,
  res: Response,
) {
  const input = loginSchema.parse(req.body);

  const result = await authService.login(input);

  return res.status(200).json({
    success: true,
    data: result,
  });
}