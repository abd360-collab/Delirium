import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { CustomerLayout } from "../../layouts/CustomerLayout";
import { AdminLayout } from "../../layouts/AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { MenuPage } from "../../features/menu/pages/MenuPage";
import { AuthenticatedRedirect } from "./AuthenticatedRedirect";
import { HomePage } from "../../features/home/pages/HomePage";



// function HomePage() {
//     return <h2>Home</h2>;
// }

function LoginPage() {
    function handleGoogleLogin() {
        const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

        window.location.href =
            `${apiBaseUrl}/auth/google`;
    }

    return (
        <div>
            <h2>Login</h2>

            <button
                type="button"
                onClick={handleGoogleLogin}
            >
                Continue with Google
            </button>
        </div>
    );
}

function OrdersPage() {
    return <h2>Orders</h2>;
}

function AdminDashboardPage() {
    return <h2>Admin Dashboard</h2>;
}

function NotFoundPage() {
    return <h2>Page not found</h2>;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <AuthProvider>
               <Routes>
    <Route element={<CustomerLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/menu" element={<MenuPage />} />

    <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
        <Route path="/orders" element={<OrdersPage />} />
    </Route>
</Route>

    <Route
        path="/auth/callback"
        element={<AuthenticatedRedirect />}
    />

    <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
            <Route
                index
                element={<AdminDashboardPage />}
            />
        </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
</Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}