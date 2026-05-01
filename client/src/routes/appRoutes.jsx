import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/authContext";
import AppLayout from "../components/layout/AppLayout";
import "./appRoutes.css";
import ScrollToTop from "./ScrollToTop";

const Login = lazy(() => import("../pages/Auth/Login"));
const Signup = lazy(() => import("../pages/Auth/Signup"));
const Home = lazy(() => import("../pages/Home/Home"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Consultation = lazy(() => import("../pages/Consultation/Consultation"));
const NewConsultation = lazy(() => import("../pages/Consultation/NewConsultation"));
const OAuthSuccess = lazy(() => import("../pages/Auth/Oauth_success"));
const RecentConsultation = lazy(
	() => import("../pages/RecentConsultation/RecentConsultation"),
);

function AppRoutes() {
	const { isAuthenticated } = useAuth();

	return (
		<>
			<ScrollToTop />
			<Suspense
				fallback={
					<div className="app-route-loading" role="status" aria-live="polite">
						Loading your workspace...
					</div>
				}
			>
				<Routes>
					<Route element={<AppLayout />}>
						<Route
							path="/"
							element={
								isAuthenticated ? <Home /> : <Navigate to="/login" replace />
							}
						/>
						<Route
							path="/profile"
							element={
								isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
							}
						/>

						<Route
							path="/consultation/new"
							element={
								isAuthenticated ? (
									<NewConsultation />
								) : (
									<Navigate to="/login" replace />
								)
							}
						/>
						<Route
							path="/consultation/chat/:consultationId"
							element={
								isAuthenticated ? (
									<Consultation />
								) : (
									<Navigate to="/login" replace />
								)
							}
						/>
						<Route
							path="/consultation/recent"
							element={
								isAuthenticated ? (
									<RecentConsultation />
								) : (
									<Navigate to="/login" replace />
								)
							}
						/>

						<Route
							path="/login"
							element={
								isAuthenticated ? <Navigate to="/" replace /> : <Login />
							}
						/>
						<Route
							path="/signup"
							element={
								isAuthenticated ? <Navigate to="/" replace /> : <Signup />
							}
						/>
						<Route path="/oauth-success" element={<OAuthSuccess />} />

						{/* Keeps unmatched URLs routed through the auth-aware home flow. */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Route>
				</Routes>
			</Suspense>
		</>
	);
}

export default AppRoutes;
