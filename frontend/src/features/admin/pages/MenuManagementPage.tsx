
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    createMenuItem,
    getCategories,
    getMenuItems,
    updateMenuItem,
    uploadMenuImage,
} from "../../../api/menu.api";

import type {
    Category,
    MenuItem,
    CreateMenuItemInput,
} from "../../../types/menu.types";

function formatCurrency(amountInPaise: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amountInPaise / 100);
}

const initialForm = {
    categoryId: "",
    name: "",
    description: "",
    price: "",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

export function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [formData, setFormData] = useState(initialForm);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [updatingAvailabilityIds, setUpdatingAvailabilityIds] =
        useState<Set<string>>(() => new Set());

    const [availabilityError, setAvailabilityError] = useState("");

    // Price editing state
    const [editingPriceItemId, setEditingPriceItemId] =
        useState<string | null>(null);

    const [editingPrice, setEditingPrice] = useState("");
    const [savingPriceItemId, setSavingPriceItemId] =
        useState<string | null>(null);

    const [priceError, setPriceError] = useState("");
    const [priceSuccess, setPriceSuccess] = useState("");

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const fetchMenuData = useCallback(async (signal: AbortSignal) => {
        try {
            const [items, categoryList] = await Promise.all([
                getMenuItems(),
                getCategories(),
            ]);

            if (signal.aborted) return;

            setMenuItems(items);
            setCategories(categoryList);
            setError("");
        } catch {
            if (signal.aborted) return;

            setError("Could not load menu data. Please try again.");
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
            void fetchMenuData(controller.signal);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [fetchMenuData, refreshKey]);

    const categoryMap = useMemo(
        () =>
            new Map(
                categories.map((category) => [
                    category.id,
                    category.name,
                ]),
            ),
        [categories],
    );

    const filteredMenuItems = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return menuItems.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(normalizedSearch);

            const matchesCategory =
                selectedCategory === "ALL" ||
                item.categoryId === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [menuItems, search, selectedCategory]);

    const activeCount = menuItems.filter(
        (item) => item.isActive,
    ).length;

    const unavailableCount = menuItems.filter(
        (item) => !item.isAvailable,
    ).length;

    const activeCategories = categories.filter(
        (category) => category.isActive,
    );

    function refreshMenu() {
        if (menuItems.length === 0) {
            setIsLoading(true);
        }

        setRefreshKey((current) => current + 1);
    }

    function updateFormField(
        field: keyof typeof initialForm,
        value: string,
    ) {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));

        setFormError("");
        setSuccessMessage("");
    }

    // Start editing the price of a particular menu item.
    function startPriceEditing(item: MenuItem) {
        setEditingPriceItemId(item.id);
        setEditingPrice((item.priceInPaise / 100).toFixed(2));
        setPriceError("");
        setPriceSuccess("");
    }

    // Cancel price editing.
    function cancelPriceEditing() {
        setEditingPriceItemId(null);
        setEditingPrice("");
        setPriceError("");
    }

    // Save the updated price.
    async function handlePriceUpdate(item: MenuItem) {
        if (savingPriceItemId) return;

        setPriceError("");
        setPriceSuccess("");

        const normalizedPrice = editingPrice.trim();

        // Allow positive numbers with up to two decimal places.
        if (!/^\d+(\.\d{1,2})?$/.test(normalizedPrice)) {
            setPriceError(
                "Enter a valid price with up to two decimal places.",
            );
            return;
        }

        const price = Number(normalizedPrice);

        if (!Number.isFinite(price) || price <= 0) {
            setPriceError("Price must be greater than zero.");
            return;
        }

        const priceInPaise = Math.round(price * 100);

        if (
            !Number.isSafeInteger(priceInPaise) ||
            priceInPaise <= 0
        ) {
            setPriceError("Please enter a valid price.");
            return;
        }

        if (priceInPaise === item.priceInPaise) {
            cancelPriceEditing();
            return;
        }

        try {
            setSavingPriceItemId(item.id);

            const updatedItem = await updateMenuItem(item.id, {
                priceInPaise,
            });

            setMenuItems((current) =>
                current.map((menuItem) =>
                    menuItem.id === updatedItem.id
                        ? updatedItem
                        : menuItem,
                ),
            );

            setEditingPriceItemId(null);
            setEditingPrice("");
            setPriceSuccess(
                `Price updated successfully for "${item.name}".`,
            );
        } catch {
            setPriceError(
                `Could not update the price for "${item.name}". Please try again.`,
            );
        } finally {
            setSavingPriceItemId(null);
        }
    }

    async function handleAvailabilityToggle(item: MenuItem) {
        if (updatingAvailabilityIds.has(item.id)) return;

        setAvailabilityError("");

        setUpdatingAvailabilityIds((current) => {
            const updated = new Set(current);
            updated.add(item.id);
            return updated;
        });

        try {
            const updatedItem = await updateMenuItem(item.id, {
                isAvailable: !item.isAvailable,
            });

            setMenuItems((current) =>
                current.map((menuItem) =>
                    menuItem.id === updatedItem.id
                        ? updatedItem
                        : menuItem,
                ),
            );
        } catch {
            setAvailabilityError(
                `Could not update availability for "${item.name}". Please try again.`,
            );
        } finally {
            setUpdatingAvailabilityIds((current) => {
                const updated = new Set(current);
                updated.delete(item.id);
                return updated;
            });
        }
    }

    function handleImageChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        setFormError("");
        setSuccessMessage("");

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setFormError(
                "Only JPEG, PNG and WebP images are allowed.",
            );

            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setFormError("Image size cannot exceed 5 MB.");

            event.target.value = "";
            return;
        }

        setSelectedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
    }

    function clearSelectedImage() {
        setSelectedImage(null);
        setImagePreviewUrl("");

        const input = document.getElementById(
            "menu-item-image",
        ) as HTMLInputElement | null;

        if (input) {
            input.value = "";
        }

        setFormError("");
    }

    function resetForm() {
        setFormData(initialForm);
        setSelectedImage(null);
        setImagePreviewUrl("");
        setFormError("");
        setSuccessMessage("");

        const input = document.getElementById(
            "menu-item-image",
        ) as HTMLInputElement | null;

        if (input) {
            input.value = "";
        }
    }

    async function handleCreateMenuItem(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setFormError("");
        setSuccessMessage("");

        const price = Number(formData.price);

        if (!Number.isFinite(price) || price <= 0) {
            setFormError(
                "Please enter a valid price greater than zero.",
            );
            return;
        }

        const priceInPaise = Math.round(price * 100);

        if (!Number.isSafeInteger(priceInPaise) || priceInPaise <= 0) {
            setFormError("Please enter a valid price.");
            return;
        }

        try {
            setIsSaving(true);

            let imageUrl: string | undefined;

            if (selectedImage) {
                setIsUploadingImage(true);

                const uploadResult = await uploadMenuImage(
                    selectedImage,
                );

                imageUrl = uploadResult.imageUrl;

                setIsUploadingImage(false);
            }

            const payload: CreateMenuItemInput = {
                categoryId: formData.categoryId,
                name: formData.name.trim(),
                priceInPaise,
                ...(formData.description.trim() && {
                    description: formData.description.trim(),
                }),
                ...(imageUrl && {
                    imageUrl,
                }),
            };

            await createMenuItem(payload);

            const updatedMenuItems = await getMenuItems();

            setMenuItems(updatedMenuItems);
            resetForm();
            setIsCreateFormOpen(false);

            setSuccessMessage(
                "Menu item created successfully.",
            );
        } catch {
            setIsUploadingImage(false);

            setFormError(
                "Could not save the menu item or upload its image. Please try again.",
            );
        } finally {
            setIsSaving(false);
            setIsUploadingImage(false);
        }
    }

    return (
        <section className="admin-dashboard admin-menu">
            <header className="admin-dashboard__header">
                <div>
                    <p className="admin-dashboard__eyebrow">
                        RESTAURANT MANAGEMENT
                    </p>

                    <h1>Menu Management</h1>

                    <p>
                        Manage your restaurant's menu items and categories.
                    </p>
                </div>

                <div className="admin-menu-header-actions">
                    <button
                        type="button"
                        className="admin-refresh-button"
                        onClick={refreshMenu}
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Refresh menu"}
                    </button>

                    <button
                        type="button"
                        className="admin-menu-add-button"
                        onClick={() => {
                            setIsCreateFormOpen((current) => !current);
                            setFormError("");
                            setSuccessMessage("");
                        }}
                    >
                        {isCreateFormOpen
                            ? "Close form"
                            : "+ Add Menu Item"}
                    </button>
                </div>
            </header>

            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}

            {successMessage && (
                <p className="admin-settings-success" role="status">
                    {successMessage}
                </p>
            )}

            {priceSuccess && (
                <p className="admin-settings-success" role="status">
                    {priceSuccess}
                </p>
            )}

            {isCreateFormOpen && (
                <section className="admin-menu-form-card">
                    <div className="admin-menu-form-heading">
                        <div>
                            <h2>Add New Menu Item</h2>
                            <p>
                                Enter the details of the new item you want to
                                add to your restaurant menu.
                            </p>
                        </div>
                    </div>

                    {formError && (
                        <p className="admin-error" role="alert">
                            {formError}
                        </p>
                    )}

                    {activeCategories.length === 0 ? (
                        <p className="admin-error" role="alert">
                            No active categories are available. Create or
                            activate a category before adding menu items.
                        </p>
                    ) : (
                        <form
                            className="admin-menu-form"
                            onSubmit={handleCreateMenuItem}
                        >
                            <div className="admin-menu-form-grid">
                                <label className="admin-menu-field">
                                    Item Name *
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(event) =>
                                            updateFormField(
                                                "name",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="e.g. Belgian Chocolate Waffle"
                                        maxLength={150}
                                        required
                                    />
                                </label>

                                <label className="admin-menu-field">
                                    Category *
                                    <select
                                        value={formData.categoryId}
                                        onChange={(event) =>
                                            updateFormField(
                                                "categoryId",
                                                event.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select a category
                                        </option>

                                        {activeCategories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="admin-menu-field">
                                    Price (₹) *
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(event) =>
                                            updateFormField(
                                                "price",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="e.g. 149"
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </label>

                                <div className="admin-menu-field admin-menu-image-field">
                                    <span>Menu Item Image</span>

                                    <label
                                        className="admin-menu-image-upload"
                                        htmlFor="menu-item-image"
                                    >
                                        <input
                                            id="menu-item-image"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            disabled={isSaving}
                                        />

                                        <span>
                                            <strong>
                                                {selectedImage
                                                    ? "Choose another image"
                                                    : "Choose an image"}
                                            </strong>

                                            <small>
                                                JPEG, PNG or WebP · Maximum 5 MB
                                            </small>
                                        </span>
                                    </label>

                                    {imagePreviewUrl && (
                                        <div className="admin-menu-image-preview">
                                            <img
                                                src={imagePreviewUrl}
                                                alt="Selected menu item preview"
                                            />

                                            <div>
                                                <strong>
                                                    {selectedImage?.name}
                                                </strong>

                                                <small>
                                                    {selectedImage
                                                        ? `${(
                                                            selectedImage.size /
                                                            (1024 * 1024)
                                                        ).toFixed(2)} MB`
                                                        : ""}
                                                </small>

                                                <button
                                                    type="button"
                                                    onClick={clearSelectedImage}
                                                    disabled={isSaving}
                                                >
                                                    Remove image
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <label className="admin-menu-field admin-menu-field--full">
                                    Description
                                    <textarea
                                        value={formData.description}
                                        onChange={(event) =>
                                            updateFormField(
                                                "description",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Describe this menu item..."
                                        maxLength={1000}
                                        rows={3}
                                    />
                                </label>
                            </div>

                            {isUploadingImage && (
                                <p
                                    className="admin-menu-upload-status"
                                    role="status"
                                >
                                    <span className="admin-menu-upload-spinner" />
                                    Uploading image to Cloudinary...
                                </p>
                            )}

                            <div className="admin-menu-form-actions">
                                <button
                                    type="button"
                                    className="admin-refresh-button"
                                    onClick={resetForm}
                                    disabled={isSaving}
                                >
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    className="admin-menu-add-button"
                                    disabled={isSaving}
                                >
                                    {isUploadingImage
                                        ? "Uploading image..."
                                        : isSaving
                                            ? "Saving..."
                                            : "Save Menu Item"}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            )}

            {!isLoading && (
                <div className="admin-menu-stats">
                    <article className="admin-menu-stat">
                        <span>Total Menu Items</span>
                        <strong>{menuItems.length}</strong>
                    </article>

                    <article className="admin-menu-stat">
                        <span>Active Items</span>
                        <strong>{activeCount}</strong>
                    </article>

                    <article className="admin-menu-stat">
                        <span>Unavailable Items</span>
                        <strong>{unavailableCount}</strong>
                    </article>

                    <article className="admin-menu-stat">
                        <span>Categories</span>
                        <strong>{categories.length}</strong>
                    </article>
                </div>
            )}

            <div className="admin-menu-toolbar">
                <input
                    type="search"
                    placeholder="Search menu items..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search menu items"
                />

                <select
                    value={selectedCategory}
                    onChange={(event) =>
                        setSelectedCategory(event.target.value)
                    }
                    aria-label="Filter by category"
                >
                    <option value="ALL">All categories</option>

                    {categories.map((category) => (
                        <option
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {availabilityError && (
                <p className="admin-error" role="alert">
                    {availabilityError}
                </p>
            )}

            {priceError && (
                <p className="admin-error" role="alert">
                    {priceError}
                </p>
            )}

            {isLoading ? (
                <p role="status">Loading menu items...</p>
            ) : filteredMenuItems.length === 0 ? (
                <div className="admin-dashboard__empty">
                    <h3>No menu items found</h3>
                    <p>
                        {menuItems.length === 0
                            ? "Your menu items will appear here."
                            : "Try changing your search or category filter."}
                    </p>
                </div>
            ) : (
                <div className="admin-menu-table-wrapper">
                    <table className="admin-menu-table">
                        <thead>
                            <tr>
                                <th>Menu Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Availability</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredMenuItems.map((item) => {
                                const isUpdating =
                                    updatingAvailabilityIds.has(item.id);

                                const isEditingPrice =
                                    editingPriceItemId === item.id;

                                const isSavingPrice =
                                    savingPriceItemId === item.id;

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="admin-menu-item-info">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="admin-menu-item-placeholder">
                                                        No image
                                                    </div>
                                                )}

                                                <div>
                                                    <strong>{item.name}</strong>

                                                    <small>
                                                        {item.description ||
                                                            "No description"}
                                                    </small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            {categoryMap.get(item.categoryId) ??
                                                "Unknown category"}
                                        </td>

                                        <td className="admin-menu-price">
                                            {isEditingPrice ? (
                                                <div className="admin-menu-price-editor">
                                                    <label>
                                                        <span className="sr-only">
                                                            New price for {item.name}
                                                        </span>

                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={editingPrice}
                                                            onChange={(event) => {
                                                                setEditingPrice(
                                                                    event.target.value,
                                                                );
                                                                setPriceError("");
                                                            }}
                                                            disabled={isSavingPrice}
                                                            autoFocus
                                                        />
                                                    </label>

                                                    <div className="admin-menu-price-actions">
                                                        <button
                                                            type="button"
                                                            className="admin-menu-add-button"
                                                            onClick={() =>
                                                                void handlePriceUpdate(item)
                                                            }
                                                            disabled={isSavingPrice}
                                                        >
                                                            {isSavingPrice
                                                                ? "Saving..."
                                                                : "Save"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="admin-refresh-button"
                                                            onClick={cancelPriceEditing}
                                                            disabled={isSavingPrice}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="admin-menu-price-display">
                                                    <strong>
                                                        {formatCurrency(item.priceInPaise)}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className="admin-refresh-button"
                                                        onClick={() =>
                                                            startPriceEditing(item)
                                                        }
                                                        disabled={
                                                            savingPriceItemId !== null
                                                        }
                                                    >
                                                        Edit Price
                                                    </button>
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-menu-status ${
                                                    item.isActive
                                                        ? "is-active"
                                                        : "is-inactive"
                                                }`}
                                            >
                                                {item.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-menu-availability-control">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={item.isAvailable}
                                                    aria-label={`Mark ${item.name} as ${
                                                        item.isAvailable
                                                            ? "unavailable"
                                                            : "available"
                                                    }`}
                                                    className={`admin-menu-availability-toggle ${
                                                        item.isAvailable
                                                            ? "is-available"
                                                            : "is-unavailable"
                                                    }`}
                                                    onClick={() =>
                                                        void handleAvailabilityToggle(item)
                                                    }
                                                    disabled={isUpdating}
                                                >
                                                    <span className="admin-menu-availability-toggle__thumb" />
                                                </button>

                                                <span
                                                    className={`admin-menu-status ${
                                                        item.isAvailable
                                                            ? "is-available"
                                                            : "is-unavailable"
                                                    }`}
                                                >
                                                    {isUpdating
                                                        ? "Updating..."
                                                        : item.isAvailable
                                                            ? "Available"
                                                            : "Unavailable"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!isLoading && filteredMenuItems.length > 0 && (
                <p className="admin-menu-result-count">
                    Showing {filteredMenuItems.length} of{" "}
                    {menuItems.length} menu items
                </p>
            )}
        </section>
    );
}
