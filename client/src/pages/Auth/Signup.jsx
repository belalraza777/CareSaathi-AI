import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";

// Manages signup form state and sends registration data through auth context.
const Signup = () => {
	const { handleRegister } = useAuth();

	const [form, setForm] = useState({
		name: "",
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

		const result = await handleRegister(form);

		if (result.success) {
			setMessage(result.message || "Account created successfully");
		} else {
			setMessage(result.message || "Signup failed");
		}

		setLoading(false);
	};

	return (
		<div>
			<h2>Sign Up</h2>

			<form onSubmit={onSubmit}>
				<div>
					<label htmlFor="name">Name</label>
					<input
						id="name"
						type="text"
						name="name"
						value={form.name}
						onChange={onChange}
						required
					/>
				</div>

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
						minLength={6}
						required
					/>
				</div>

				<button type="submit" disabled={loading}>
					{loading ? "Creating account..." : "Sign up"}
				</button>
			</form>

			{message && <p>{message}</p>}

			<p>
				Already have an account?{" "}
				<Link to="/login">Login</Link>
			</p>
		</div>
	);
};

export default Signup;
