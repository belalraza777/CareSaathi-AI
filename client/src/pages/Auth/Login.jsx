import { useState,useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

// Manages login form state and submits credentials through auth context.
const Login = () => {
	const { handleLogin } = useAuth();
	const navigate = useNavigate();

	const [form, setForm] = useState({
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		const result = await handleLogin(form);

		if (result.success) {
			setMessage(result.message || "Login successful");
			navigate("/");
		} else {
			setMessage(result.message || "Login failed");
		}

		setLoading(false);
	};

	// Get Google auth URL
	const googleAuthUrl = useMemo(() => {
		const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
		return `${base.replace(/\/$/, "")}/auth/google`;
	}, []);

	return (
		<div>
			<h2>Login</h2>

			<form onSubmit={onSubmit}>
				<div>
					<label htmlFor="email">Email</label>
					<input
						id="email"
						type="email"
						name="email"
						value={form.email}
						onChange={onChange}
						required
					/>
				</div>

				<div>
					<label htmlFor="password">Password</label>
					<input
						id="password"
						type="password"
						name="password"
						value={form.password}
						onChange={onChange}
						required
					/>
				</div>

				<button type="submit" disabled={loading}>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>

			{message && <p>{message}</p>}
			<a href={googleAuthUrl} className="auth-page__btn auth-page__btn--google">
				Continue with Google
			</a>
			<p>
				Don&apos;t have an account?{" "}
				<Link to="/signup">Sign up</Link>
			</p>
		</div>
	);
};

export default Login;
