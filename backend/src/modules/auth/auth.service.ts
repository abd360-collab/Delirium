import { AppError  } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../errors/errorCodes.js";
import { generateAccessToken, generateRefreshToken } from "../../lib/jwt.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { authRepository  } from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";



export const authService = {
    async register(input: RegisterInput) {
        const existingUser = await authRepository.findUserByEmail(
            input.email,
        );

        if(existingUser) {
            throw new AppError(
                ERROR_CODES.USER_ALREADY_EXISTS,
                "An account with this email already exists",
                409,
            );
        }

        const passwordHash = await hashPassword(input.password);

        const user = await authRepository.createUser({
            name: input.name,
            email: input.email,
            passwordHash,
        });

        return user;
    },

    async login(input: LoginInput) {
        const user = await authRepository.findUserByEmail(
            input.email,
        );

        if(!user) {
            throw new AppError(
                ERROR_CODES.INVALID_CREDENTIALS,
                "Invalid email or password",
                401,
            );
        }

        const isPasswordValid = await verifyPassword(
            input.password,
            user.passwordHash,
        );

        if(!isPasswordValid) {
            throw new AppError(
                ERROR_CODES.INVALID_CREDENTIALS,
                "Invalid email or password",
                401,
            );
        }


        const accessToken = generateAccessToken({
            sub: user.id,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            sub: user.id,
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        };

    },
};