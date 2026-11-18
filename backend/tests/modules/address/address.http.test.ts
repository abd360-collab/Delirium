import { randomUUID } from "node:crypto";
import request from "supertest";
import {
    afterAll,
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/infrastructure/database/prisma.js";
import { generateAccessToken } from "../../../src/shared/security/jwt.js";

let userIds: string[] = [];

async function createUser() {
    const uniqueId = randomUUID();

    const user = await prisma.user.create({
        data: {
            name: "Address HTTP Test User",
            email: `address-http-${uniqueId}@example.com`,
            googleId: `address-http-${uniqueId}`,
        },
    });

    userIds.push(user.id);
    return user;
}

function createToken(userId: string) {
    return generateAccessToken({
        sub: userId,
        role: "CUSTOMER",
    });
}

function validAddress(overrides: Record<string, unknown> = {}) {
    return {
        label: "Home",
        recipientName: "Test User",
        phoneNumber: "9876543210",
        addressLine: "123 Test Street, Kolkata",
        latitude: 22.503,
        longitude: 88.361,
        isDefault: false,
        ...overrides,
    };
}

async function createSavedAddress(userId: string, isDefault = false) {
    return prisma.address.create({
        data: {
            userId,
            ...validAddress({ isDefault }),
        },
    });
}

beforeEach(() => {
    userIds = [];
});

afterEach(async () => {
    if (userIds.length > 0) {
        await prisma.user.deleteMany({
            where: {
                id: { in: userIds },
            },
        });
    }
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Address HTTP Integration", () => {
    describe("Authentication", () => {
        it("should reject requests without an access token", async () => {
            const response = await request(app)
                .get("/api/v1/addresses");

            expect(response.status).toBe(401);
            expect(response.body).toMatchObject({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
            });
        });

        it("should reject an invalid access token", async () => {
            const response = await request(app)
                .get("/api/v1/addresses")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe("UNAUTHORIZED");
        });

        it("should reject an incorrectly formatted authorization header", async () => {
            const response = await request(app)
                .get("/api/v1/addresses")
                .set("Authorization", "Invalid token");

            expect(response.status).toBe(401);
            expect(response.body.error.message).toBe(
                "Invalid authorization header",
            );
        });
    });

    describe("GET /api/v1/addresses", () => {
        it("should return only the authenticated user's addresses", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const ownAddress = await createSavedAddress(user.id);
            await createSavedAddress(anotherUser.id);

            const response = await request(app)
                .get("/api/v1/addresses")
                .set("Authorization", `Bearer ${createToken(user.id)}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].id).toBe(ownAddress.id);
            expect(response.body.data[0].userId).toBe(user.id);
        });

        it("should return an empty array when the user has no saved addresses", async () => {
            const user = await createUser();

            const response = await request(app)
                .get("/api/v1/addresses")
                .set("Authorization", `Bearer ${createToken(user.id)}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                data: [],
            });
        });
    });

    describe("POST /api/v1/addresses", () => {
        it("should create an address successfully", async () => {
            const user = await createUser();

            const response = await request(app)
                .post("/api/v1/addresses")
                .set("Authorization", `Bearer ${createToken(user.id)}`)
                .send(validAddress());

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                userId: user.id,
                label: "Home",
                recipientName: "Test User",
                phoneNumber: "9876543210",
                isDefault: true,
            });
        });

        it("should reject an invalid phone number", async () => {
            const user = await createUser();

            const response = await request(app)
                .post("/api/v1/addresses")
                .set("Authorization", `Bearer ${createToken(user.id)}`)
                .send(validAddress({
                    phoneNumber: "123",
                }));

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe("VALIDATION_ERROR");
            expect(response.body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "phoneNumber",
                    }),
                ]),
            );
        });

        it("should reject coordinates outside valid geographic ranges", async () => {
            const user = await createUser();

            const response = await request(app)
                .post("/api/v1/addresses")
                .set("Authorization", `Bearer ${createToken(user.id)}`)
                .send(validAddress({
                    latitude: 91,
                }));

            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe("VALIDATION_ERROR");
        });
    });

    describe("PATCH /api/v1/addresses/:addressId", () => {
        it("should update an address successfully", async () => {
            const user = await createUser();
            const address = await createSavedAddress(user.id);

            const response = await request(app)
                .patch(`/api/v1/addresses/${address.id}`)
                .set("Authorization", `Bearer ${createToken(user.id)}`)
                .send({
                    label: "Office",
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.label).toBe("Office");

            const updated = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(updated?.label).toBe("Office");
        });

        it("should return 404 when updating another user's address", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const address = await createSavedAddress(user.id);

            const response = await request(app)
                .patch(`/api/v1/addresses/${address.id}`)
                .set("Authorization", `Bearer ${createToken(anotherUser.id)}`)
                .send({
                    label: "Unauthorized",
                });

            expect(response.status).toBe(404);
            expect(response.body.error.message).toBe("Address not found");
        });
    });

    describe("PATCH /api/v1/addresses/:addressId/default", () => {
        it("should set the selected address as default", async () => {
            const user = await createUser();

            const firstAddress = await createSavedAddress(user.id, true);
            const secondAddress = await createSavedAddress(user.id, false);

            const response = await request(app)
                .patch(`/api/v1/addresses/${secondAddress.id}/default`)
                .set("Authorization", `Bearer ${createToken(user.id)}`);

            expect(response.status).toBe(200);
            expect(response.body.data.isDefault).toBe(true);

            const firstUpdated = await prisma.address.findUnique({
                where: { id: firstAddress.id },
            });

            const secondUpdated = await prisma.address.findUnique({
                where: { id: secondAddress.id },
            });

            expect(firstUpdated?.isDefault).toBe(false);
            expect(secondUpdated?.isDefault).toBe(true);
        });

        it("should return 404 when setting another user's address as default", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const address = await createSavedAddress(user.id);

            const response = await request(app)
                .patch(`/api/v1/addresses/${address.id}/default`)
                .set("Authorization", `Bearer ${createToken(anotherUser.id)}`);

            expect(response.status).toBe(404);
            expect(response.body.error.message).toBe("Address not found");
        });
    });

    describe("DELETE /api/v1/addresses/:addressId", () => {
        it("should delete an address successfully", async () => {
            const user = await createUser();
            const address = await createSavedAddress(user.id);

            const response = await request(app)
                .delete(`/api/v1/addresses/${address.id}`)
                .set("Authorization", `Bearer ${createToken(user.id)}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                message: "Address deleted successfully",
            });

            const deleted = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(deleted).toBeNull();
        });

        it("should return 404 when deleting another user's address", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const address = await createSavedAddress(user.id);

            const response = await request(app)
                .delete(`/api/v1/addresses/${address.id}`)
                .set("Authorization", `Bearer ${createToken(anotherUser.id)}`);

            expect(response.status).toBe(404);
            expect(response.body.error.message).toBe("Address not found");

            const existing = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(existing).not.toBeNull();
        });
    });
});
