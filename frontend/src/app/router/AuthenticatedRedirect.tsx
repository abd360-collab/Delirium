import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";



export function AuthenticatedRedirect() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
}