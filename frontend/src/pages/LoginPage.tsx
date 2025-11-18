import { type FormEvent, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { authAtom } from "../state/authAtoms";
import { useAuth } from "../hooks/useAuth";
import type { AxiosError } from "axios";

export const LoginPage = () => {
	const auth = useAtomValue(authAtom);
	const { login } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (auth.isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			await login(email, password);
			navigate("/dashboard", { replace: true });
		} catch (err: unknown) {
			let message = "Credenciales inválidas o error en el servidor";

			const maybeAxiosError = err as AxiosError<{ message?: string }>;
			const serverMessage = maybeAxiosError.response?.data?.message;

			if (
				typeof serverMessage === "string" &&
				serverMessage.trim() !== ""
			) {
				message = serverMessage;
			}

			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-100">
			<div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
				<div className="flex flex-col items-center mb-6">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
						<BuildingOffice2Icon
							className="h-7 w-7"
							aria-hidden="true"
						/>
					</div>
					<h1 className="mt-4 text-2xl font-semibold text-slate-900">
						Iniciar sesión
					</h1>
				</div>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-slate-700">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="tu@email.com"
							required
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-slate-700">
							Contraseña
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="••••••••"
							required
						/>
					</div>

					{error && (
						<div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{loading ? "Ingresando..." : "Ingresar"}
					</button>
				</form>
			</div>
		</div>
	);
};
