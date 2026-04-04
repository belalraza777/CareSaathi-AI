import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import "./AppLayout.css";

function AppLayout() {
    return (
        <div className="app-shell">
            <AppHeader />
            {/* Route content is rendered inside one shared shell for cleaner pages. */}
            <main className="app-main">
                <Outlet />
            </main>
            <AppFooter />
        </div>
    );
}

export default AppLayout;
