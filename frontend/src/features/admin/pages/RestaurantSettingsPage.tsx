
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
    getRestaurant,
    updateRestaurant,
} from "../../../api/restaurant.api";

import type {
    Restaurant,
    UpdateRestaurantInput,
} from "../../../types/restaurant.types";

interface RestaurantFormState {
    name: string;
    description: string;
    address: string;
    phoneNumber: string;
    email: string;
    latitude: string;
    longitude: string;
    deliveryRadiusKm: string;
    imageUrl: string;
    isOpen: boolean;
}

const initialFormState: RestaurantFormState = {
    name: "",
    description: "",
    address: "",
    phoneNumber: "",
    email: "",
    latitude: "",
    longitude: "",
    deliveryRadiusKm: "5",
    imageUrl: "",
    isOpen: true,
};

function toFormState(restaurant: Restaurant): RestaurantFormState {
    return {
        name: restaurant.name,
        description: restaurant.description ?? "",
        address: restaurant.address,
        phoneNumber: restaurant.phoneNumber ?? "",
        email: restaurant.email ?? "",
        latitude: String(restaurant.latitude),
        longitude: String(restaurant.longitude),
        deliveryRadiusKm: String(restaurant.deliveryRadiusKm),
        imageUrl: restaurant.imageUrl ?? "",
        isOpen: restaurant.isOpen,
    };
}

export function RestaurantSettingsPage() {
    const [form, setForm] =
        useState<RestaurantFormState>(initialFormState);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadRestaurant() {
            try {
                setError(null);

                const restaurant = await getRestaurant();

                if (isMounted) {
                    setForm(toFormState(restaurant));
                }
            } catch {
                if (isMounted) {
                    setError(
                        "Unable to load restaurant information. Please try again.",
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadRestaurant();

        return () => {
            isMounted = false;
        };
    }, []);

    function handleChange(
        event: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >,
    ) {
        const { name, value, type } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? (event.target as HTMLInputElement).checked
                    : value,
        }));

        setError(null);
        setSuccess(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);
        setSuccess(null);

        const latitude = Number(form.latitude);
        const longitude = Number(form.longitude);
        const deliveryRadiusKm = Number(form.deliveryRadiusKm);

        if (
            !Number.isFinite(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            setError("Please enter a valid latitude.");
            return;
        }

        if (
            !Number.isFinite(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {
            setError("Please enter a valid longitude.");
            return;
        }

        if (
            !Number.isFinite(deliveryRadiusKm) ||
            deliveryRadiusKm <= 0 ||
            deliveryRadiusKm > 100
        ) {
            setError("Delivery radius must be between 0 and 100 km.");
            return;
        }

        const input: UpdateRestaurantInput = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            address: form.address.trim(),
            phoneNumber: form.phoneNumber.trim() || null,
            email: form.email.trim() || null,
            latitude,
            longitude,
            deliveryRadiusKm,
            imageUrl: form.imageUrl.trim() || null,
            isOpen: form.isOpen,
        };

        try {
            setIsSaving(true);

            const updatedRestaurant =
                await updateRestaurant(input);

            setForm(toFormState(updatedRestaurant));
            setSuccess("Restaurant settings saved successfully.");
        } catch {
            setError(
                "Unable to save restaurant settings. Please check your information and try again.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="admin-settings-loading">
                Loading restaurant settings...
            </div>
        );
    }

    return (
        <div className="admin-restaurant-settings">
            <header className="admin-dashboard__header">
                <div>
                    <p className="admin-dashboard__eyebrow">
                        RESTAURANT MANAGEMENT
                    </p>

                    <h1>Restaurant Settings</h1>

                    <p>
                        Manage your restaurant information, delivery
                        location and operating status.
                    </p>
                </div>
            </header>

            {error && (
                <div className="admin-error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div
                    className="admin-settings-success"
                    role="status"
                >
                    {success}
                </div>
            )}

            <form
                className="admin-settings-form"
                onSubmit={handleSubmit}
            >
                <section className="admin-settings-card">
                    <div className="admin-settings-card__heading">
                        <h2>Restaurant Information</h2>
                        <p>
                            Basic information displayed to your customers.
                        </p>
                    </div>

                    <div className="admin-settings-grid">
                        <label className="admin-settings-field">
                            Restaurant Name
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                maxLength={150}
                            />
                        </label>

                        <label className="admin-settings-field">
                            Phone Number
                            <input
                                name="phoneNumber"
                                type="tel"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                maxLength={15}
                                placeholder="Optional"
                            />
                        </label>

                        <label className="admin-settings-field">
                            Email Address
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
                        </label>

                        <label className="admin-settings-field admin-settings-field--full">
                            Description
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                maxLength={1000}
                                placeholder="Describe your restaurant..."
                            />
                        </label>

                        <label className="admin-settings-field admin-settings-field--full">
                            Restaurant Image URL
                            <input
                                name="imageUrl"
                                type="url"
                                value={form.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </label>
                    </div>
                </section>

                <section className="admin-settings-card">
                    <div className="admin-settings-card__heading">
                        <h2>Location & Delivery</h2>
                        <p>
                            Configure your restaurant location and
                            delivery coverage.
                        </p>
                    </div>

                    <div className="admin-settings-grid">
                        <label className="admin-settings-field admin-settings-field--full">
                            Restaurant Address
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows={2}
                                required
                                minLength={5}
                                maxLength={500}
                            />
                        </label>

                        <label className="admin-settings-field">
                            Latitude
                            <input
                                name="latitude"
                                type="number"
                                step="any"
                                min="-90"
                                max="90"
                                value={form.latitude}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="admin-settings-field">
                            Longitude
                            <input
                                name="longitude"
                                type="number"
                                step="any"
                                min="-180"
                                max="180"
                                value={form.longitude}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="admin-settings-field">
                            Delivery Radius (KM)
                            <input
                                name="deliveryRadiusKm"
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="100"
                                value={form.deliveryRadiusKm}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    <p className="admin-settings-hint">
                        Customers outside this delivery radius will
                        not be able to place delivery orders.
                    </p>
                </section>

                <section className="admin-settings-card">
                    <div className="admin-settings-card__heading">
                        <h2>Restaurant Availability</h2>
                        <p>
                            Control whether customers can place new orders.
                        </p>
                    </div>

                    <label className="admin-settings-toggle">
                        <input
                            type="checkbox"
                            name="isOpen"
                            checked={form.isOpen}
                            onChange={handleChange}
                        />

                        <span className="admin-settings-toggle__content">
                            <strong>
                                {form.isOpen
                                    ? "Restaurant is open"
                                    : "Restaurant is closed"}
                            </strong>

                            <small>
                                {form.isOpen
                                    ? "Customers can place orders."
                                    : "Customers cannot place new orders."}
                            </small>
                        </span>

                        <span
                            className={`admin-settings-status ${
                                form.isOpen ? "is-open" : "is-closed"
                            }`}
                        >
                            {form.isOpen ? "OPEN" : "CLOSED"}
                        </span>
                    </label>
                </section>

                <div className="admin-settings-actions">
                    <button
                        type="submit"
                        className="admin-settings-save"
                        disabled={isSaving}
                    >
                        {isSaving
                            ? "Saving Changes..."
                            : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
