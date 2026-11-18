import { randomUUID } from "node:crypto";
import {
    afterAll,
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import { prisma } from "../../../src/infrastructure/database/prisma.js";
import { addressRepository } from "../../../src/modules/address/address.repository.js";

let userIds: string[] = [];

async function createUser() {
    const uniqueId = randomUUID();

    const user = await prisma.user.create({
        data: {
            name: "Address Test User",
            email: `address-test-${uniqueId}@example.com`,
            googleId: `address-test-${uniqueId}`,
        },
    });

    userIds.push(user.id);
    return user;
}

async function createAddress(
    userId: string,
    overrides: Partial<{
        label: string;
        recipientName: string;
        phoneNumber: string;
        addressLine: string;
        latitude: number;
        longitude: number;
        isDefault: boolean;
    }> = {},
) {
    return addressRepository.create({
        userId,
        label: "Home",
        recipientName: "Test User",
        phoneNumber: "9876543210",
        addressLine: "123 Test Street, Kolkata",
        latitude: 22.503,
        longitude: 88.361,
        isDefault: false,
        ...overrides,
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

describe("Address Repository (Database Integration)", () => {
    describe("findAllByUserId", () => {
        it("should return only addresses belonging to the requested user", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const ownAddress = await createAddress(user.id);
            await createAddress(anotherUser.id);

            const result = await addressRepository.findAllByUserId(user.id);

            expect(result).toHaveLength(1);
            expect(result[0]?.id).toBe(ownAddress.id);
            expect(result[0]?.userId).toBe(user.id);
        });
    });

    describe("findByIdAndUserId", () => {
        it("should find an address belonging to the user", async () => {
            const user = await createUser();
            const address = await createAddress(user.id);

            const result = await addressRepository.findByIdAndUserId(
                address.id,
                user.id,
            );

            expect(result?.id).toBe(address.id);
        });

        it("should not return another user's address", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const address = await createAddress(user.id);

            const result = await addressRepository.findByIdAndUserId(
                address.id,
                anotherUser.id,
            );

            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("should persist an address with the supplied values", async () => {
            const user = await createUser();

            const result = await createAddress(user.id, {
                label: "Office",
                isDefault: true,
            });

            expect(result).toMatchObject({
                userId: user.id,
                label: "Office",
                recipientName: "Test User",
                phoneNumber: "9876543210",
                isDefault: true,
            });

            expect(result.id).toBeDefined();
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe("update", () => {
        it("should update an address belonging to the user", async () => {
            const user = await createUser();
            const address = await createAddress(user.id);

            const result = await addressRepository.update(
                address.id,
                user.id,
                { label: "Office" },
            );

            expect(result.count).toBe(1);

            const updated = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(updated?.label).toBe("Office");
        });

        it("should not update an address belonging to another user", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const address = await createAddress(user.id);

            const result = await addressRepository.update(
                address.id,
                anotherUser.id,
                { label: "Unauthorized Update" },
            );

            expect(result.count).toBe(0);

            const unchanged = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(unchanged?.label).toBe("Home");
        });
    });

    describe("delete", () => {
        it("should delete an address belonging to the user", async () => {
            const user = await createUser();
            const address = await createAddress(user.id);

            const result = await addressRepository.delete(
                address.id,
                user.id,
            );

            expect(result.count).toBe(1);

            const deleted = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(deleted).toBeNull();
        });

        it("should not delete another user's address", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const address = await createAddress(user.id);

            const result = await addressRepository.delete(
                address.id,
                anotherUser.id,
            );

            expect(result.count).toBe(0);

            const existing = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(existing).not.toBeNull();
        });
    });

    describe("clearDefaultForUser", () => {
        it("should clear default addresses only for the specified user", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const ownAddress = await createAddress(user.id, {
                isDefault: true,
            });

            const otherAddress = await createAddress(anotherUser.id, {
                isDefault: true,
            });

            const result = await addressRepository.clearDefaultForUser(
                user.id,
            );

            expect(result.count).toBe(1);

            const updatedOwnAddress = await prisma.address.findUnique({
                where: { id: ownAddress.id },
            });

            const unchangedOtherAddress = await prisma.address.findUnique({
                where: { id: otherAddress.id },
            });

            expect(updatedOwnAddress?.isDefault).toBe(false);
            expect(unchangedOtherAddress?.isDefault).toBe(true);
        });
    });

    describe("setDefault", () => {
        it("should set the selected address as default", async () => {
            const user = await createUser();
            const address = await createAddress(user.id);

            const result = await addressRepository.setDefault(
                address.id,
                user.id,
            );

            expect(result.count).toBe(1);

            const updated = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(updated?.isDefault).toBe(true);
        });

        it("should not set another user's address as default", async () => {
            const user = await createUser();
            const anotherUser = await createUser();

            const address = await createAddress(user.id);

            const result = await addressRepository.setDefault(
                address.id,
                anotherUser.id,
            );

            expect(result.count).toBe(0);

            const unchanged = await prisma.address.findUnique({
                where: { id: address.id },
            });

            expect(unchanged?.isDefault).toBe(false);
        });
    });
});
