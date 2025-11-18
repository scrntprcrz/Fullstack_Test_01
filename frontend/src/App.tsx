import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

import { UsuariosPage } from "./pages/UsuariosPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layout/AppLayout";
import { ProyectosPage } from "./pages/ProyectosPage";
import { TareasPage } from "./pages/TareasPage";
import { PerfilesPage } from "./pages/PerfilesPage";

export const App = () => {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />

			<Route
				element={
					<ProtectedRoute>
						<AppLayout />
					</ProtectedRoute>
				}
			>
				<Route path="/dashboard" element={<DashboardPage />} />
				<Route path="/admin/usuarios" element={<UsuariosPage />} />
				<Route path="/admin/perfiles" element={<PerfilesPage />} />
				<Route
					path="/proyectos/proyectos"
					element={<ProyectosPage />}
				/>
				<Route path="/proyectos/tareas" element={<TareasPage />} />
				<Route path="/perfil" element={<UserProfilePage />} />
			</Route>

			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
};
export default App;
