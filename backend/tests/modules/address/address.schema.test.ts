import { describe, expect, it } from "vitest";

import {
    createAddressSchema,
    updateAddressSchema,
} from "../../../src/modules/address/address.schema.js";

const validAddress = {
    label: "Home",
    recipientName: "Test User",
    phoneNumber: "9876543210",
    addressLine: "123 Test Street, Kolkata",
    latitude: 22.503,
    longitude: 88.361,
};

describe("Address schemas", () => {
    describe("createAddressSchema", () => {
        it("should accept a valid address", () => {
            const result = createAddressSchema.safeParse(validAddress);

            expect(result.success).toBe(true);
        });

        it("should trim string fields", () => {
            const result = createAddressSchema.parse({
                ...validAddress,
                label: "  Home  ",
                recipientName: "  Test User  ",
            });

            expect(result.label).toBe("Home");
            expect(result.recipientName).toBe("Test User");
        });

        it("should default isDefault to false", () => {
            const result = createAddressSchema.parse(validAddress);

            expect(result.isDefault).toBe(false);
        });

        it("should reject an invalid phone number", () => {
            const result = createAddressSchema.safeParse({
                ...validAddress,
                phoneNumber: "12345",
            });

            expect(result.success).toBe(false);
        });

        it("should reject latitude outside the valid range", () => {
            const result = createAddressSchema.safeParse({
                ...validAddress,
                latitude: 91,
            });

            expect(result.success).toBe(false);
        });

        it("should reject longitude outside the valid range", () => {
            const result = createAddressSchema.safeParse({
                ...validAddress,
                longitude: 181,
            });

            expect(result.success).toBe(false);
        });

        it("should coerce numeric coordinate strings into numbers", () => {
            const result = createAddressSchema.parse({
                ...validAddress,
                latitude: "22.503",
                longitude: "88.361",
            });

            expect(result.latitude).toBe(22.503);
            expect(result.longitude).toBe(88.361);
        });
    });

    describe("updateAddressSchema", () => {
        it("should accept a partial address update", () => {
            const result = updateAddressSchema.safeParse({
                label: "Work",
            });

            expect(result.success).toBe(true);
        });

        it("should accept isDefault as an optional update field", () => {
            const result = updateAddressSchema.safeParse({
                isDefault: true,
            });

            expect(result.success).toBe(true);
        });

        it("should reject an invalid phone number during update", () => {
            const result = updateAddressSchema.safeParse({
                phoneNumber: "invalid",
            });

            expect(result.success).toBe(false);
        });
    });
});
