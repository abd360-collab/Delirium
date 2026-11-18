
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function PublicOnlyRoute() {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        if (user?.role === "ADMIN") {
            return <Navigate to="/admin" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
