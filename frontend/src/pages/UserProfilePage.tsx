import { useAuth } from "../hooks/useAuth";
import { NoUserInfoMessage } from "../components/user/NoUserInfoMessage";
import { UserProfileInfoCard } from "../components/user/UserProfileInfoCard";

export const UserProfilePage = () => {
	const { auth } = useAuth();

	if (!auth.user) {
		return <NoUserInfoMessage />;
	}

	const { nombreCompleto, usuario, correo, empresaId } = auth.user;

	return (
		<div className="space-y-8">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight text-slate-900">
					Mi cuenta
				</h1>
				<p className="text-sm text-slate-500">
					Información básica de tu perfil.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
				<UserProfileInfoCard
					nombreCompleto={nombreCompleto}
					usuario={usuario}
					correo={correo}
					empresaId={empresaId}
				/>
			</div>
		</div>
	);
};
