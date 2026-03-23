import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";

// Manages login form state and submits credentials through auth context.
const Login = () => {
	const { handleLogin } = useAuth();

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
		} else {
			setMessage(result.message || "Login failed");
		}

		setLoading(false);
	};

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

			<p>
				Don&apos;t have an account?{" "}
				<Link to="/signup">Sign up</Link>
			</p>
		</div>
	);
};

export default Login;
