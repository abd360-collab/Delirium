
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";
import {
    createAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress,
    type SavedAddress,
} from "../../../api/address.api";
import type { DeliveryLocation } from "../components/DeliveryLocationMap";
import DeliveryLocationMap from "../components/DeliveryLocationMap";

interface AddressForm {
    label: string;
    recipientName: string;
    phoneNumber: string;
    addressLine: string;
    latitude: number | null;
    longitude: number | null;
    isDefault: boolean;
}

const INITIAL_FORM: AddressForm = {
    label: "Home",
    recipientName: "",
    phoneNumber: "",
    addressLine: "",
    latitude: null,
    longitude: null,
    isDefault: false,
};

const RESTAURANT_LOCATION = {
    latitude: 22.503053546678277,
    longitude: 88.36097805582347,
};

const DELIVERY_RADIUS_KM = 5;

function getDistanceKm(latitude: number, longitude: number): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const latitudeDifference = toRadians(
        latitude - RESTAURANT_LOCATION.latitude,
    );
    const longitudeDifference = toRadians(
        longitude - RESTAURANT_LOCATION.longitude,
    );

    const haversine =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(RESTAURANT_LOCATION.latitude)) *
            Math.cos(toRadians(latitude)) *
            Math.sin(longitudeDifference / 2) ** 2;

    const centralAngle =
        2 *
        Math.atan2(
            Math.sqrt(Math.max(0, haversine)),
            Math.sqrt(Math.max(0, 1 - haversine)),
        );

    return earthRadiusKm * centralAngle;
}

export function ProfilePage() {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [form, setForm] = useState<AddressForm>(INITIAL_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [locationResolving, setLocationResolving] = useState(false);

    const [listError, setListError] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const mountedRef = useRef(true);

    const selectedDistanceKm =
        form.latitude !== null && form.longitude !== null
            ? getDistanceKm(form.latitude, form.longitude)
            : null;

    const isOutsideDeliveryArea =
        selectedDistanceKm !== null &&
        selectedDistanceKm > DELIVERY_RADIUS_KM;

    const actionInProgress = saving || pendingAction !== null;

    useEffect(() => {
        let ignore = false;
        mountedRef.current = true;

        getAddresses()
            .then((result: SavedAddress[]) => {
                if (ignore) return;

                setAddresses(result);
                setListError("");
            })
            .catch(() => {
                if (ignore) return;

                setListError("We couldn't load your saved addresses.");
            })
            .finally(() => {
                if (ignore) return;

                setLoading(false);
            });

        return () => {
            ignore = true;
            mountedRef.current = false;
        };
    }, []);

    const loadAddresses = useCallback(async () => {
        setLoading(true);
        setListError("");

        try {
            const result = await getAddresses();

            if (!mountedRef.current) return false;

            setAddresses(result);
            return true;
        } catch {
            if (mountedRef.current) {
                setListError("We couldn't load your saved addresses.");
            }

            return false;
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    function resetForm() {
        setForm(INITIAL_FORM);
        setEditingId(null);
        setLocationResolving(false);
        setError("");
        setMessage("");
    }

    function handleLocationSelectionStart() {
        // Invalidate previous coordinates as soon as a new pin is selected.
        setForm((current) => ({
            ...current,
            latitude: null,
            longitude: null,
        }));

        setLocationResolving(true);
        setError("");
        setMessage("Finding the address for your selected location...");
    }

    function handleLocationResolvingChange(isResolving: boolean) {
        setLocationResolving(isResolving);

        if (!isResolving) {
            setMessage("");
        }
    }

    function handleLocationSelect(location: DeliveryLocation) {
        setForm((current) => ({
            ...current,
            latitude: location.latitude,
            longitude: location.longitude,
            addressLine: location.address || current.addressLine,
        }));

        setLocationResolving(false);
        setError("");
        setMessage(
            "Location selected. Check the delivery distance before saving.",
        );
    }

    function startEditing(address: SavedAddress) {
        setEditingId(address.id);
        setLocationResolving(false);

        setForm({
            label: address.label,
            recipientName: address.recipientName,
            phoneNumber: address.phoneNumber,
            addressLine: address.addressLine,
            latitude: address.latitude,
            longitude: address.longitude,
            isDefault: address.isDefault,
        });

        setError("");
        setMessage("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setMessage("");

        if (actionInProgress) return;

        if (locationResolving) {
            setError("Please wait while we find your selected address.");
            return;
        }

        if (form.latitude === null || form.longitude === null) {
            setError("Please select your delivery location on the map.");
            return;
        }

        if (form.addressLine.trim().length < 5) {
            setError("Please enter a complete delivery address.");
            return;
        }

        if (isOutsideDeliveryArea) {
            setError(
                `Sorry, this location is ${selectedDistanceKm!.toFixed(2)} km away. Delirium delivers only within ${DELIVERY_RADIUS_KM} km of the restaurant.`,
            );
            return;
        }

        const phone = form.phoneNumber.trim();

        if (!/^\d{10,15}$/.test(phone)) {
            setError("Enter a valid phone number using 10–15 digits.");
            return;
        }

        const input = {
            label: form.label.trim(),
            recipientName: form.recipientName.trim(),
            phoneNumber: phone,
            addressLine: form.addressLine.trim(),
            latitude: form.latitude,
            longitude: form.longitude,
            isDefault: form.isDefault,
        };

        if (!input.label || !input.recipientName) {
            setError("Please enter an address label and recipient name.");
            return;
        }

        setSaving(true);

        try {
            if (editingId) {
                await updateAddress(editingId, input);
            } else {
                await createAddress(input);
            }

            if (!mountedRef.current) return;

            const wasEditing = editingId !== null;

            resetForm();

            setMessage(
                wasEditing
                    ? "Address updated successfully."
                    : "Address saved successfully.",
            );

            await loadAddresses();
        } catch {
            if (mountedRef.current) {
                setError("We couldn't save this address. Please try again.");
            }
        } finally {
            if (mountedRef.current) {
                setSaving(false);
            }
        }
    }

    async function handleDelete(address: SavedAddress) {
        if (actionInProgress) return;

        const confirmed = window.confirm(
            `Delete your "${address.label}" address?`,
        );

        if (!confirmed) return;

        setError("");
        setMessage("");
        setPendingAction(`delete:${address.id}`);

        try {
            await deleteAddress(address.id);

            if (!mountedRef.current) return;

            if (editingId === address.id) {
                resetForm();
            }

            setMessage("Address deleted successfully.");
            await loadAddresses();
        } catch {
            if (mountedRef.current) {
                setError("We couldn't delete this address. Please try again.");
            }
        } finally {
            if (mountedRef.current) {
                setPendingAction(null);
            }
        }
    }

    async function handleSetDefault(address: SavedAddress) {
        if (actionInProgress || address.isDefault) return;

        setError("");
        setMessage("");
        setPendingAction(`default:${address.id}`);

        try {
            await setDefaultAddress(address.id);

            if (!mountedRef.current) return;

            setMessage("Default delivery address updated.");
            await loadAddresses();
        } catch {
            if (mountedRef.current) {
                setError(
                    "We couldn't update your default address. Please try again.",
                );
            }
        } finally {
            if (mountedRef.current) {
                setPendingAction(null);
            }
        }
    }

    return (
        <div className="profile-page">
            <header className="profile-page__header">
                <p className="profile-page__eyebrow">YOUR DELIRIUM</p>
                <h1>Your profile</h1>
                <p>Manage your delivery details and saved addresses.</p>
            </header>

            <section
                className="profile-section"
                aria-labelledby="address-form-heading"
            >
                <div className="profile-section__header">
                    <div>
                        <p className="profile-section__eyebrow">
                            DELIVERY DETAILS
                        </p>
                        <h2 id="address-form-heading">
                            {editingId ? "Edit address" : "Add a new address"}
                        </h2>
                    </div>
                </div>

                <form className="address-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="address-label">Address label</label>
                        <select
                            id="address-label"
                            value={form.label}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    label: event.target.value,
                                }))
                            }
                            disabled={actionInProgress}
                            required
                        >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="recipient-name">Recipient name</label>
                        <input
                            id="recipient-name"
                            type="text"
                            autoComplete="name"
                            value={form.recipientName}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    recipientName: event.target.value,
                                }))
                            }
                            placeholder="Who will receive the order?"
                            disabled={actionInProgress}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="address-phone">Phone number</label>
                        <input
                            id="address-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            value={form.phoneNumber}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    phoneNumber: event.target.value,
                                }))
                            }
                            placeholder="10-digit phone number"
                            disabled={actionInProgress}
                            required
                        />
                    </div>

                    <div className="form-field address-map-field">
                        <label>Choose your delivery location</label>
                        <p className="address-help-text">
                            Use your current location, search for an address,
                            or select a point directly on the map. Delivery is
                            available only within 5 km of our restaurant.
                        </p>

                        <DeliveryLocationMap
                            key={editingId ?? "new-address"}
                            initialPosition={
                                form.latitude !== null &&
                                form.longitude !== null
                                    ? {
                                          latitude: form.latitude,
                                          longitude: form.longitude,
                                      }
                                    : undefined
                            }
                            onLocationSelect={handleLocationSelect}
                            onLocationSelectionStart={
                                handleLocationSelectionStart
                            }
                            onLocationResolvingChange={
                                handleLocationResolvingChange
                            }
                        />
                    </div>

                    {locationResolving && (
                        <p className="profile-message" role="status">
                            Finding your selected address. Saving is disabled
                            until this finishes.
                        </p>
                    )}

                    {selectedDistanceKm !== null && (
                        <div
                            className={`delivery-area-status ${
                                isOutsideDeliveryArea
                                    ? "delivery-area-status--outside"
                                    : "delivery-area-status--inside"
                            }`}
                            role="status"
                            aria-live="polite"
                        >
                            <strong>
                                {isOutsideDeliveryArea
                                    ? "Outside delivery area"
                                    : "Within delivery area"}
                            </strong>
                            <p>
                                {selectedDistanceKm.toFixed(2)} km from
                                Delirium.{" "}
                                {isOutsideDeliveryArea
                                    ? `Please select a location within ${DELIVERY_RADIUS_KM} km.`
                                    : "Delivery is available at this location."}
                            </p>
                        </div>
                    )}

                    <div className="form-field address-map-field">
                        <label htmlFor="address-line">
                            Complete delivery address
                        </label>
                        <textarea
                            id="address-line"
                            value={form.addressLine}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    addressLine: event.target.value,
                                }))
                            }
                            placeholder="House/flat number, street, area, landmark"
                            rows={3}
                            disabled={actionInProgress}
                            required
                        />
                    </div>

                    <label className="default-address-control">
                        <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    isDefault: event.target.checked,
                                }))
                            }
                            disabled={actionInProgress}
                        />
                        <span>Set as my default delivery address</span>
                    </label>

                    {error && (
                        <p
                            className="profile-message profile-message--error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {message && (
                        <p
                            className="profile-message profile-message--success"
                            role="status"
                        >
                            {message}
                        </p>
                    )}

                    <div className="address-form__actions">
                        <button
                            type="submit"
                            className="profile-button profile-button--primary"
                            disabled={
                                actionInProgress ||
                                locationResolving ||
                                form.latitude === null ||
                                form.longitude === null ||
                                isOutsideDeliveryArea
                            }
                        >
                            {saving
                                ? "Saving..."
                                : locationResolving
                                  ? "Finding location..."
                                  : editingId
                                    ? "Update address"
                                    : "Save address"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="profile-button profile-button--secondary"
                                onClick={resetForm}
                                disabled={actionInProgress}
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section
                className="profile-section"
                aria-labelledby="saved-addresses-heading"
            >
                <div className="profile-section__header">
                    <div>
                        <p className="profile-section__eyebrow">
                            READY WHEN YOU ARE
                        </p>
                        <h2 id="saved-addresses-heading">
                            Your saved addresses
                        </h2>
                    </div>
                </div>

                {listError && (
                    <div
                        className="profile-message profile-message--error"
                        role="alert"
                    >
                        <p>{listError}</p>
                        <button
                            type="button"
                            className="profile-button profile-button--secondary"
                            onClick={() => void loadAddresses()}
                            disabled={loading || actionInProgress}
                        >
                            {loading ? "Loading..." : "Try again"}
                        </button>
                    </div>
                )}

                {loading ? (
                    <p role="status">Loading your saved addresses...</p>
                ) : listError ? null : addresses.length === 0 ? (
                    <p className="profile-empty-state">
                        You haven't saved an address yet. Add one above to make
                        your next order easier.
                    </p>
                ) : (
                    <div className="saved-address-list">
                        {addresses.map((address) => (
                            <article
                                className="saved-address-card"
                                key={address.id}
                            >
                                <div className="saved-address-card__content">
                                    <div className="saved-address-card__title">
                                        <h3>{address.label}</h3>
                                        {address.isDefault && (
                                            <span className="default-address-badge">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <p>
                                        <strong>{address.recipientName}</strong>
                                    </p>
                                    <p>{address.phoneNumber}</p>
                                    <p>{address.addressLine}</p>

                                    {address.latitude != null &&
                                        address.longitude != null && (
                                            <p className="location-coordinates">
                                                {getDistanceKm(
                                                    address.latitude,
                                                    address.longitude,
                                                ).toFixed(2)}{" "}
                                                km from the restaurant
                                            </p>
                                        )}
                                </div>

                                <div className="saved-address-card__actions">
                                    <button
                                        type="button"
                                        className="profile-button profile-button--secondary"
                                        onClick={() => startEditing(address)}
                                        disabled={actionInProgress}
                                    >
                                        Edit
                                    </button>

                                    {!address.isDefault && (
                                        <button
                                            type="button"
                                            className="profile-button profile-button--secondary"
                                            onClick={() =>
                                                void handleSetDefault(address)
                                            }
                                            disabled={actionInProgress}
                                        >
                                            {pendingAction ===
                                            `default:${address.id}`
                                                ? "Updating..."
                                                : "Set default"}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="profile-button profile-button--danger"
                                        onClick={() =>
                                            void handleDelete(address)
                                        }
                                        disabled={actionInProgress}
                                    >
                                        {pendingAction ===
                                        `delete:${address.id}`
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
