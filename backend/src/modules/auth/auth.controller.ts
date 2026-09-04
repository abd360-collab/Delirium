import type { Request, Response } from "express";
import { loginSchema, refreshTokenSchema, registerSchema } from "./auth.schema.js";
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


export async function refresh(
    req: Request,
    res: Response,
) {
    const input = refreshTokenSchema.parse(req.body);

    const result = await authService.refresh(input);

    return res.status(200).json({
        success: true,
        data: result,
    });
}


export async function logout(
    req: Request,
    res: Response,
) {
    const input = refreshTokenSchema.parse(req.body);

    await authService.logout(input);

    return res.status(204).send();
}



export async function logoutAll(
    req: Request,
    res: Response,
) {
    await authService.logoutAll(req.user!.id);

    return res.status(204).send();
}


export async function getMe(
    req: Request,
    res: Response,
) {
    const user = await authService.getMe(req.user!.id);

    return res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
}


