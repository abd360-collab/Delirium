
import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type DeliveryLocation = {
    latitude: number;
    longitude: number;
    address: string;
};

type DeliveryLocationMapProps = {
    initialPosition?: {
        latitude: number;
        longitude: number;
    } | null;
    onLocationSelect: (location: DeliveryLocation) => void;
    onLocationSelectionStart?: () => void;
    onLocationResolvingChange?: (isResolving: boolean) => void;
};

type Coordinates = {
    latitude: number;
    longitude: number;
};

const RESTAURANT_POSITION: Coordinates = {
    latitude: 22.503053546678277,
    longitude: 88.36097805582347,
};

const markerIcon = L.divIcon({
    className: "delivery-map-marker-wrapper",
    html: '<div class="delivery-map-marker"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

async function reverseGeocode(
    latitude: number,
    longitude: number,
    signal: AbortSignal,
): Promise<string> {
    const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        addressdetails: "1",
    });

    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
            headers: {
                Accept: "application/json",
            },
            signal,
        },
    );

    if (!response.ok) {
        throw new Error("Unable to find the address for this location.");
    }

    const data: { display_name?: string } = await response.json();

    if (!data.display_name) {
        throw new Error("No readable address was found. Try another location.");
    }

    return data.display_name;
}

function MapClickHandler({
    onMapClick,
}: {
    onMapClick: (position: Coordinates) => void;
}) {
    useMapEvents({
        click(event) {
            onMapClick({
                latitude: event.latlng.lat,
                longitude: event.latlng.lng,
            });
        },
    });

    return null;
}

function MapCenterUpdater({ position }: { position: Coordinates }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo([position.latitude, position.longitude], 16, {
            animate: true,
            duration: 0.5,
        });
    }, [map, position.latitude, position.longitude]);

    return null;
}

export default function DeliveryLocationMap({
    initialPosition,
    onLocationSelect,
    onLocationSelectionStart,
    onLocationResolvingChange,
}: DeliveryLocationMapProps) {
    const [position, setPosition] = useState<Coordinates>(
        initialPosition ?? RESTAURANT_POSITION,
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [address, setAddress] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);
    const [error, setError] = useState("");

    const isGeolocationAvailable =
        typeof navigator !== "undefined" && "geolocation" in navigator;

    const mountedRef = useRef(false);
    const requestIdRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);

    const onLocationSelectRef = useRef(onLocationSelect);
    const onLocationSelectionStartRef = useRef(onLocationSelectionStart);
    const onLocationResolvingChangeRef = useRef(onLocationResolvingChange);

    useEffect(() => {
        onLocationSelectRef.current = onLocationSelect;
        onLocationSelectionStartRef.current = onLocationSelectionStart;
        onLocationResolvingChangeRef.current = onLocationResolvingChange;
    }, [
        onLocationSelect,
        onLocationSelectionStart,
        onLocationResolvingChange,
    ]);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            requestIdRef.current += 1;
            abortControllerRef.current?.abort();
        };
    }, []);

    const selectPosition = useCallback(async (nextPosition: Coordinates) => {
        if (
            !Number.isFinite(nextPosition.latitude) ||
            !Number.isFinite(nextPosition.longitude) ||
            nextPosition.latitude < -90 ||
            nextPosition.latitude > 90 ||
            nextPosition.longitude < -180 ||
            nextPosition.longitude > 180
        ) {
            setError("The selected map coordinates are invalid.");
            return;
        }

        const requestId = ++requestIdRef.current;

        abortControllerRef.current?.abort();

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setPosition(nextPosition);
        setAddress("");
        setError("");
        setIsResolvingAddress(true);

        // Notify the parent immediately so old coordinates cannot be saved.
        onLocationSelectionStartRef.current?.();
        onLocationResolvingChangeRef.current?.(true);

        try {
            const readableAddress = await reverseGeocode(
                nextPosition.latitude,
                nextPosition.longitude,
                controller.signal,
            );

            if (
                !mountedRef.current ||
                requestId !== requestIdRef.current
            ) {
                return;
            }

            setAddress(readableAddress);

            onLocationSelectRef.current({
                ...nextPosition,
                address: readableAddress,
            });
        } catch (err) {
            if (
                !mountedRef.current ||
                requestId !== requestIdRef.current ||
                (err instanceof Error && err.name === "AbortError")
            ) {
                return;
            }

            setAddress("");
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not find this address. Please try again.",
            );
        } finally {
            if (
                mountedRef.current &&
                requestId === requestIdRef.current
            ) {
                setIsResolvingAddress(false);
                abortControllerRef.current = null;
                onLocationResolvingChangeRef.current?.(false);
            }
        }
    }, []);

    useEffect(() => {
        if (initialPosition) {
            return;
        }

        if (!isGeolocationAvailable) {
            return;
        }

        let cancelled = false;

        navigator.geolocation.getCurrentPosition(
            (result) => {
                if (cancelled || !mountedRef.current) {
                    return;
                }

                void selectPosition({
                    latitude: result.coords.latitude,
                    longitude: result.coords.longitude,
                });
            },
            (locationError) => {
                if (cancelled || !mountedRef.current) {
                    return;
                }

                if (locationError.code === locationError.PERMISSION_DENIED) {
                    setError(
                        "Location permission was denied. You can still search or select a point on the map.",
                    );
                } else {
                    setError(
                        "Couldn't detect your current location. You can still search or select a point on the map.",
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
            },
        );

        return () => {
            cancelled = true;
        };
    }, [
        initialPosition?.latitude,
        initialPosition?.longitude,
        isGeolocationAvailable,
        selectPosition,
    ]);

    async function handleSearch() {
        const query = searchQuery.trim();

        if (!query) {
            setError("Enter an address or place to search.");
            return;
        }

        setIsSearching(true);
        setError("");

        try {
            const params = new URLSearchParams({
                format: "jsonv2",
                q: query,
                limit: "1",
                countrycodes: "in",
            });

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Address search failed. Please try again.");
            }

            const results: Array<{ lat: string; lon: string }> =
                await response.json();

            if (results.length === 0) {
                throw new Error(
                    "No matching place found. Try a nearby landmark or street.",
                );
            }

            const latitude = Number(results[0].lat);
            const longitude = Number(results[0].lon);

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                throw new Error(
                    "The search returned invalid coordinates. Try another place.",
                );
            }

            await selectPosition({ latitude, longitude });
        } catch (err) {
            if (!mountedRef.current) {
                return;
            }

            setError(
                err instanceof Error
                    ? err.message
                    : "Could not search for that address.",
            );
        } finally {
            if (mountedRef.current) {
                setIsSearching(false);
            }
        }
    }

    return (
        <section className="delivery-map" aria-labelledby="delivery-map-title">
            <div className="delivery-map__heading">
                <h3 id="delivery-map-title">Choose your delivery location</h3>
                <p>
                    Search for a place, or click the map to position the pin
                    where you want your order delivered.
                </p>
            </div>

            <div className="delivery-map__search">
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search area, street, landmark..."
                    aria-label="Search delivery location"
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            void handleSearch();
                        }
                    }}
                />

                <button
                    type="button"
                    disabled={isSearching || isResolvingAddress}
                    onClick={() => void handleSearch()}
                >
                    {isSearching ? "Searching..." : "Search"}
                </button>
            </div>

            <div className="delivery-map__canvas">
                <MapContainer
                    center={[position.latitude, position.longitude]}
                    zoom={15}
                    scrollWheelZoom
                    className="delivery-map__leaflet"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapClickHandler
                        onMapClick={(nextPosition) => {
                            void selectPosition(nextPosition);
                        }}
                    />

                    <MapCenterUpdater position={position} />

                    <Marker
                        position={[position.latitude, position.longitude]}
                        icon={markerIcon}
                        draggable
                        eventHandlers={{
                            dragend(event) {
                                const marker = event.target as L.Marker;
                                const latLng = marker.getLatLng();

                                void selectPosition({
                                    latitude: latLng.lat,
                                    longitude: latLng.lng,
                                });
                            },
                        }}
                    />
                </MapContainer>
            </div>

            <div className="delivery-map__result" aria-live="polite">
                {isResolvingAddress ? (
                    <p>Finding the address for your selected pin...</p>
                ) : address ? (
                    <>
                        <strong>Selected address</strong>
                        <p>{address}</p>
                        <small>
                            {position.latitude.toFixed(6)},{" "}
                            {position.longitude.toFixed(6)}
                        </small>
                    </>
                ) : (
                    <p>Select a point on the map to find its address.</p>
                )}

                {!isGeolocationAvailable && !initialPosition && (
                    <p>
                        Location detection is unavailable. You can still search
                        or select a point on the map.
                    </p>
                )}

                {error && (
                    <p className="delivery-map__error" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}
