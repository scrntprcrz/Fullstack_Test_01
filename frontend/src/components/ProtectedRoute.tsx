import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { authAtom } from "../state/authAtoms";

interface Props {
	children: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
	const auth = useAtomValue(authAtom);
	const location = useLocation();

	if (!auth.isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
