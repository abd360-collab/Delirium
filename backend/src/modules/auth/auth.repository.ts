import { prisma } from "../../lib/prisma.js";

type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
};

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  createUser(data: CreateUserData) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },
};