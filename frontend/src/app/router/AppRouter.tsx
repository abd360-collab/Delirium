
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AuthProvider } from "../../context/AuthContext";

import { CustomerLayout } from "../../layouts/CustomerLayout";
import { AdminLayout } from "../../layouts/AdminLayout";

import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { AuthenticatedRedirect } from "./AuthenticatedRedirect";

import { HomePage } from "../../features/home/pages/HomePage";
import { MenuPage } from "../../features/menu/pages/MenuPage";
import { CartPage } from "../../features/cart/pages/CartPage";
import { CheckoutPage } from "../../features/checkout/pages/CheckoutPage";
import { OrdersPage } from "../../features/order/pages/OrderPage";
import { ScrollToTop } from "../../components/ScrollToTop";
import { ProfilePage } from "../../features/profile/pages/ProfilePage";
import { AdminDashboardPage } from "../../features/admin/pages/AdminDashboardPage";
import { AdminOrdersPage } from "../../features/admin/pages/AdminOrdersPage";
import { AdminInvoicesPage } from "../../features/admin/pages/AdminInvoicesPage";
import { useAuth } from "../../hooks/useAuth";
import { RestaurantSettingsPage } from "../../features/admin/pages/RestaurantSettingsPage";
import { MenuManagementPage } from "../../features/admin/pages/MenuManagementPage";


function LoginPage() {


    const location = useLocation();

const returnTo =
    typeof location.state?.from === "string"
        ? location.state.from
        : "/";


    function handleGoogleLogin() {
        const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

       window.location.href =
    `${apiBaseUrl}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Welcome back</h2>
                <p>Sign in to continue to your account.</p>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                >
                    Continue with Google
                </button>
            </div>
        </div>
    );
}

function NotFoundPage() {
    return <h2>Page not found</h2>;
}



function CustomerHomeRedirect() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (user?.role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return <HomePage />;
}


export function AppRouter() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
                <Routes>
                    {/* Standalone login page — outside CustomerLayout */}
                    <Route element={<PublicOnlyRoute />}>
                        <Route
                            path="/login"
                            element={<LoginPage />}
                        />
                    </Route>

                    <Route element={<CustomerLayout />}>
                        <Route path="/" element={<CustomerHomeRedirect />} />

                        <Route
                            path="/menu"
                            element={<MenuPage />}
                        />

                        <Route element={<ProtectedRoute />}>
                            <Route
                                path="/orders"
                                element={<OrdersPage />}
                            />

                            <Route
                                path="/cart"
                                element={<CartPage />}
                            />

                            <Route
                                path="/checkout"
                                element={<CheckoutPage />}
                            />

                            <Route
    path="/profile"
    element={<ProfilePage />}
/>
                        </Route>
                    </Route>

                    <Route
                        path="/auth/callback"
                        element={<AuthenticatedRedirect />}
                    />

                    <Route element={<AdminRoute />}>
                        <Route
                            path="/admin"
                            element={<AdminLayout />}
                        >
                            <Route
                                index
                                element={<AdminDashboardPage />}
                            />

                            <Route path="orders" element={<AdminOrdersPage />} />
                            <Route path="invoices" element={<AdminInvoicesPage />} />
                            <Route
    path="restaurant"
    element={<RestaurantSettingsPage />}
/>

              <Route
    path="menu"
    element={<MenuManagementPage />}
/>

                        </Route>
                    </Route>

                    <Route
                        path="*"
                        element={<NotFoundPage />}
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
