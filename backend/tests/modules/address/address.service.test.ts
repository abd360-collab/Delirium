import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    const tx = {
        address: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn(),
        },
    };

    const prisma = {
        $transaction: vi.fn(
            async (callback: (transaction: typeof tx) => unknown) =>
                callback(tx),
        ),
    };

    const repository = {
        findAllByUserId: vi.fn(),
    };

    return { tx, prisma, repository };
});

vi.mock("../../../src/infrastructure/database/prisma.js", () => ({
    prisma: mocks.prisma,
}));

vi.mock("../../../src/modules/address/address.repository.js", () => ({
    addressRepository: mocks.repository,
}));

import { addressService } from "../../../src/modules/address/address.service.js";

const USER_ID = "user-123";
const OTHER_USER_ID = "user-456";
const ADDRESS_ID = "address-123";

function makeAddress(overrides: Record<string, unknown> = {}) {
    return {
        id: ADDRESS_ID,
        userId: USER_ID,
        label: "Home",
        recipientName: "Test User",
        phoneNumber: "9876543210",
        addressLine: "123 Test Street, Kolkata",
        latitude: 22.503,
        longitude: 88.361,
        isDefault: false,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        ...overrides,
    };
}

const createInput = {
    label: "Home",
    recipientName: "Test User",
    phoneNumber: "9876543210",
    addressLine: "123 Test Street, Kolkata",
    latitude: 22.503,
    longitude: 88.361,
    isDefault: false,
};

beforeEach(() => {
    vi.clearAllMocks();

    mocks.prisma.$transaction.mockImplementation(
        async (callback: (transaction: typeof mocks.tx) => unknown) =>
            callback(mocks.tx),
    );
});

describe("Address Service", () => {
    describe("list", () => {
        it("should return addresses belonging to the user", async () => {
            const addresses = [makeAddress()];

            mocks.repository.findAllByUserId.mockResolvedValue(addresses);

            const result = await addressService.list(USER_ID);

            expect(result).toEqual(addresses);
            expect(mocks.repository.findAllByUserId).toHaveBeenCalledWith(
                USER_ID,
            );
        });
    });

    describe("create", () => {
        it("should make the first saved address the default", async () => {
            const createdAddress = makeAddress({ isDefault: true });

            mocks.tx.address.findFirst.mockResolvedValue(null);
            mocks.tx.address.create.mockResolvedValue(createdAddress);

            const result = await addressService.create(USER_ID, createInput);

            expect(result).toEqual(createdAddress);

            expect(mocks.tx.address.create).toHaveBeenCalledWith({
                data: {
                    ...createInput,
                    userId: USER_ID,
                    isDefault: true,
                },
            });

            expect(mocks.tx.address.updateMany).not.toHaveBeenCalled();
        });

        it("should preserve a non-default address when the user already has an address", async () => {
            mocks.tx.address.findFirst.mockResolvedValue({
                id: "existing-address",
            });

            const createdAddress = makeAddress({
                id: "new-address",
                isDefault: false,
            });

            mocks.tx.address.create.mockResolvedValue(createdAddress);

            const result = await addressService.create(USER_ID, createInput);

            expect(result).toEqual(createdAddress);

            expect(mocks.tx.address.create).toHaveBeenCalledWith({
                data: {
                    ...createInput,
                    userId: USER_ID,
                    isDefault: false,
                },
            });

            expect(mocks.tx.address.updateMany).not.toHaveBeenCalled();
        });

        it("should clear the previous default when creating a new default address", async () => {
            mocks.tx.address.findFirst.mockResolvedValue({
                id: "existing-address",
            });

            const input = {
                ...createInput,
                isDefault: true,
            };

            const createdAddress = makeAddress({
                id: "new-address",
                isDefault: true,
            });

            mocks.tx.address.create.mockResolvedValue(createdAddress);

            const result = await addressService.create(USER_ID, input);

            expect(result).toEqual(createdAddress);

            expect(mocks.tx.address.updateMany).toHaveBeenCalledWith({
                where: {
                    userId: USER_ID,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });

            expect(mocks.tx.address.create).toHaveBeenCalledWith({
                data: {
                    ...input,
                    userId: USER_ID,
                    isDefault: true,
                },
            });
        });
    });

    describe("update", () => {
        it("should update an address belonging to the user", async () => {
            const existingAddress = makeAddress();

            mocks.tx.address.findFirst.mockResolvedValue(existingAddress);

            const updatedAddress = makeAddress({ label: "Office" });

            mocks.tx.address.update.mockResolvedValue(updatedAddress);

            const result = await addressService.update(
                USER_ID,
                ADDRESS_ID,
                { label: "Office" },
            );

            expect(result).toEqual(updatedAddress);

            expect(mocks.tx.address.findFirst).toHaveBeenCalledWith({
                where: {
                    id: ADDRESS_ID,
                    userId: USER_ID,
                },
            });

            expect(mocks.tx.address.update).toHaveBeenCalledWith({
                where: { id: ADDRESS_ID },
                data: { label: "Office" },
            });

            expect(mocks.tx.address.updateMany).not.toHaveBeenCalled();
        });

        it("should clear the previous default when setting an address as default", async () => {
            mocks.tx.address.findFirst.mockResolvedValue(makeAddress());

            const updatedAddress = makeAddress({ isDefault: true });

            mocks.tx.address.update.mockResolvedValue(updatedAddress);

            await addressService.update(USER_ID, ADDRESS_ID, {
                isDefault: true,
            });

            expect(mocks.tx.address.updateMany).toHaveBeenCalledWith({
                where: {
                    userId: USER_ID,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });

            expect(mocks.tx.address.update).toHaveBeenCalledWith({
                where: { id: ADDRESS_ID },
                data: { isDefault: true },
            });
        });

        it("should throw a 404 AppError when the address does not belong to the user", async () => {
            mocks.tx.address.findFirst.mockResolvedValue(null);

            await expect(
                addressService.update(OTHER_USER_ID, ADDRESS_ID, {
                    label: "Office",
                }),
            ).rejects.toMatchObject({
                name: "AppError",
                message: "Address not found",
                statusCode: 404,
                code: "VALIDATION_ERROR",
            });

            expect(mocks.tx.address.update).not.toHaveBeenCalled();
        });

        it("should allow a partial update without changing unspecified fields", async () => {
    mocks.tx.address.findFirst.mockResolvedValue(makeAddress());

    const updatedAddress = makeAddress({
        label: "Office",
    });

    mocks.tx.address.update.mockResolvedValue(updatedAddress);

    await addressService.update(USER_ID, ADDRESS_ID, {
        label: "Office",
    });

    expect(mocks.tx.address.update).toHaveBeenCalledWith({
        where: { id: ADDRESS_ID },
        data: { label: "Office" },
    });
});

it("should currently allow removing the default status without promoting another address", async () => {
    mocks.tx.address.findFirst.mockResolvedValue(
        makeAddress({ isDefault: true }),
    );

    mocks.tx.address.update.mockResolvedValue(
        makeAddress({ isDefault: false }),
    );

    await addressService.update(USER_ID, ADDRESS_ID, {
        isDefault: false,
    });

    expect(mocks.tx.address.update).toHaveBeenCalledWith({
        where: { id: ADDRESS_ID },
        data: { isDefault: false },
    });

    expect(mocks.tx.address.updateMany).not.toHaveBeenCalled();
});
    });

    describe("remove", () => {
        it("should delete an address belonging to the user", async () => {
            mocks.tx.address.findFirst.mockResolvedValue(
                makeAddress({ isDefault: false }),
            );

            mocks.tx.address.delete.mockResolvedValue(makeAddress());

            await addressService.remove(USER_ID, ADDRESS_ID);

            expect(mocks.tx.address.findFirst).toHaveBeenCalledWith({
                where: {
                    id: ADDRESS_ID,
                    userId: USER_ID,
                },
            });

            expect(mocks.tx.address.delete).toHaveBeenCalledWith({
                where: { id: ADDRESS_ID },
            });

            expect(mocks.tx.address.update).not.toHaveBeenCalled();
        });

        it("should promote the most recently updated remaining address when deleting the default", async () => {
            const remainingAddress = makeAddress({
                id: "remaining-address",
                isDefault: false,
            });

            mocks.tx.address.findFirst
                .mockResolvedValueOnce(makeAddress({ isDefault: true }))
                .mockResolvedValueOnce({ id: remainingAddress.id });

            mocks.tx.address.delete.mockResolvedValue(makeAddress());

            await addressService.remove(USER_ID, ADDRESS_ID);

            expect(mocks.tx.address.findFirst).toHaveBeenNthCalledWith(2, {
                where: { userId: USER_ID },
                orderBy: { updatedAt: "desc" },
                select: { id: true },
            });

            expect(mocks.tx.address.update).toHaveBeenCalledWith({
                where: { id: remainingAddress.id },
                data: { isDefault: true },
            });
        });

        it("should not promote another address when no addresses remain", async () => {
            mocks.tx.address.findFirst
                .mockResolvedValueOnce(makeAddress({ isDefault: true }))
                .mockResolvedValueOnce(null);

            mocks.tx.address.delete.mockResolvedValue(makeAddress());

            await addressService.remove(USER_ID, ADDRESS_ID);

            expect(mocks.tx.address.delete).toHaveBeenCalled();
            expect(mocks.tx.address.update).not.toHaveBeenCalled();
        });

        it("should throw a 404 AppError when deleting another user's address", async () => {
            mocks.tx.address.findFirst.mockResolvedValue(null);

            await expect(
                addressService.remove(OTHER_USER_ID, ADDRESS_ID),
            ).rejects.toMatchObject({
                name: "AppError",
                message: "Address not found",
                statusCode: 404,
            });

            expect(mocks.tx.address.delete).not.toHaveBeenCalled();
        });
    });

    describe("setDefault", () => {
        it("should make the selected address default", async () => {
            mocks.tx.address.findFirst.mockResolvedValue({
                id: ADDRESS_ID,
            });

            const updatedAddress = makeAddress({ isDefault: true });

            mocks.tx.address.update.mockResolvedValue(updatedAddress);

            const result = await addressService.setDefault(
                USER_ID,
                ADDRESS_ID,
            );

            expect(result).toEqual(updatedAddress);

            expect(mocks.tx.address.findFirst).toHaveBeenCalledWith({
                where: {
                    id: ADDRESS_ID,
                    userId: USER_ID,
                },
                select: { id: true },
            });

            expect(mocks.tx.address.updateMany).toHaveBeenCalledWith({
                where: {
                    userId: USER_ID,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });

            expect(mocks.tx.address.update).toHaveBeenCalledWith({
                where: { id: ADDRESS_ID },
                data: { isDefault: true },
            });
        });

        it("should throw a 404 AppError when the address does not belong to the user", async () => {
            mocks.tx.address.findFirst.mockResolvedValue(null);

            await expect(
                addressService.setDefault(OTHER_USER_ID, ADDRESS_ID),
            ).rejects.toMatchObject({
                name: "AppError",
                message: "Address not found",
                statusCode: 404,
            });

            expect(mocks.tx.address.updateMany).not.toHaveBeenCalled();
            expect(mocks.tx.address.update).not.toHaveBeenCalled();
        });
    });
});
