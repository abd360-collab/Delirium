
import { NavLink, Outlet } from "react-router-dom";

export function AdminLayout() {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__brand">
                    <div className="admin-sidebar__logo">
                        D
                    </div>

                    <div>
                        <h1>DELIRIUM</h1>
                        <p>Restaurant Admin</p>
                    </div>
                </div>

                <div className="admin-sidebar__section-label">
                    WORKSPACE
                </div>

                <nav className="admin-sidebar__nav">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `admin-sidebar__link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>▦</span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/menu"
                        className={({ isActive }) =>
                            `admin-sidebar__link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>▦</span>
                        Menu Management
                    </NavLink>

                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `admin-sidebar__link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>▤</span>
                        Orders
                    </NavLink>

                    <NavLink
                        to="/admin/invoices"
                        className={({ isActive }) =>
                            `admin-sidebar__link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>▧</span>
                        Invoices
                    </NavLink>

                    <NavLink
                        to="/admin/restaurant"
                        className={({ isActive }) =>
                            `admin-sidebar__link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>⚙</span>
                        Restaurant Settings
                    </NavLink>
                </nav>

                <div className="admin-sidebar__footer">
                    <span className="admin-sidebar__status-dot" />
                    Restaurant workspace
                    <small>Admin access</small>
                </div>
            </aside>

            <div className="admin-layout__content">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-topbar__eyebrow">
                            DELIRIUM / MANAGEMENT
                        </p>

                        <h2>Restaurant Operations</h2>
                    </div>

                    <div className="admin-topbar__badge">
                        <span className="admin-sidebar__status-dot" />
                        Administrator
                    </div>
                </header>

                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
