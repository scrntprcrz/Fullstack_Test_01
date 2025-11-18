import { type ReactNode, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { AuthMenuItem, AuthModulo } from "../state/authAtoms";
import {
	Bars3Icon,
	XMarkIcon,
	BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

type UserMenuPanelProps = {
	name: string;
	email?: string;
	onAccountClick: () => void;
	onLogoutClick: () => Promise<void> | void;
	onClose: () => void;
};

type HeaderUserMenuProps = {
	initials: string;
	name: string;
	email?: string;
	onAccountClick: () => void;
	onLogoutClick: () => Promise<void> | void;
};

type SidebarUserMenuProps = HeaderUserMenuProps;

const getUserInitials = (name: string): string => {
	const trimmed = name.trim();
	if (!trimmed) return "US";
	const parts = trimmed.split(/\s+/);
	if (parts.length === 1) {
		return trimmed.slice(0, 2).toUpperCase();
	}
	return (parts[0][0] + parts[1][0]).toUpperCase();
};

const UserMenuPanel = ({
	name,
	email,
	onAccountClick,
	onLogoutClick,
	onClose,
}: UserMenuPanelProps) => {
	const handleAccountClick = () => {
		onAccountClick();
		onClose();
	};

	const handleLogoutClick = async () => {
		await onLogoutClick();
		onClose();
	};

	return (
		<div className="w-64 rounded-2xl border border-slate-200 bg-white p-1.5 text-sm text-slate-900 shadow-lg shadow-slate-900/10">
			<div className="px-3 py-2">
				<p className="text-xs font-medium text-slate-500">
					Sesión iniciada como
				</p>
				<p className="mt-1 truncate text-sm font-semibold text-slate-900">
					{name}
				</p>
				{email && (
					<p className="mt-0.5 truncate text-xs text-slate-500">
						{email}
					</p>
				)}
			</div>
			<div className="my-1 h-px bg-slate-200" />
			<button
				type="button"
				onClick={handleAccountClick}
				className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
			>
				<span>Mi cuenta</span>
			</button>
			<button
				type="button"
				onClick={handleLogoutClick}
				className="mt-0.5 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
			>
				<span>Salir</span>
			</button>
		</div>
	);
};

const HeaderUserMenu = ({
	initials,
	name,
	email,
	onAccountClick,
	onLogoutClick,
}: HeaderUserMenuProps) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-sm ring-1 ring-slate-900/10"
			>
				<span>{initials}</span>
			</button>
			{open && (
				<div className="absolute right-0 top-11">
					<UserMenuPanel
						name={name}
						email={email}
						onAccountClick={onAccountClick}
						onLogoutClick={onLogoutClick}
						onClose={() => setOpen(false)}
					/>
				</div>
			)}
		</div>
	);
};

const SidebarUserMenu = ({
	initials,
	name,
	email,
	onAccountClick,
	onLogoutClick,
}: SidebarUserMenuProps) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-white"
			>
				<span className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
						{initials}
					</div>
					<span className="flex min-w-0 flex-col">
						<span className="truncate text-sm">{name}</span>
						{email && (
							<span className="truncate text-xs text-slate-500">
								{email}
							</span>
						)}
					</span>
				</span>
				<ChevronUpDownIcon className="h-4 w-4 flex-none text-slate-400" />
			</button>
			{open && (
				<div className="absolute bottom-14 left-0">
					<UserMenuPanel
						name={name}
						email={email}
						onAccountClick={onAccountClick}
						onLogoutClick={onLogoutClick}
						onClose={() => setOpen(false)}
					/>
				</div>
			)}
		</div>
	);
};

const filterVisibleItems = (items: AuthMenuItem[]): AuthMenuItem[] => {
	const result: AuthMenuItem[] = [];
	items.forEach((item) => {
		const visibleSelf = item.permisos.puedeVer && !!item.ruta;
		const children = item.children ?? [];
		const visibleChildren = filterVisibleItems(children);
		if (visibleSelf || visibleChildren.length > 0) {
			result.push({
				...item,
				children: visibleChildren,
			});
		}
	});
	return result;
};

const buildVisibleMenu = (modulos: AuthModulo[]): AuthModulo[] => {
	return modulos
		.map((modulo) => {
			const menu = filterVisibleItems(modulo.menu ?? []);
			return { ...modulo, menu };
		})
		.filter((modulo) => modulo.menu.length > 0);
};

const renderMenuItems = (
	items: AuthMenuItem[],
	level: number,
	onItemClick?: () => void
): ReactNode => {
	return items.map((item) => {
		const hasChildren = item.children && item.children.length > 0;
		const indentClass = level > 0 ? "ml-5" : "";
		const children = hasChildren
			? renderMenuItems(item.children, level + 1, onItemClick)
			: null;

		if (!item.ruta) {
			return (
				<div key={item.id} className={indentClass}>
					<div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
						{item.etiqueta || item.codigo}
					</div>
					{children}
				</div>
			);
		}

		return (
			<div key={item.id} className={indentClass}>
				<NavLink
					to={item.ruta}
					onClick={onItemClick}
					className={({ isActive }) =>
						`flex items-center rounded-xl px-2.5 py-2 text-sm font-medium ${
							isActive
								? "bg-slate-100 text-slate-900"
								: "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
						}`
					}
				>
					<span className="truncate">
						{item.etiqueta || item.codigo}
					</span>
				</NavLink>
				{children}
			</div>
		);
	});
};

export const AppLayout = () => {
	const { auth, logout } = useAuth();
	const navigate = useNavigate();
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const visibleModulos = useMemo(
		() => (auth.menu ? buildVisibleMenu(auth.menu) : []),
		[auth.menu]
	);

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const handleAccountClick = () => {
		navigate("/perfil");
	};

	const userName =
		auth.user?.nombreCompleto || auth.user?.usuario || "Usuario";

	const userEmail = auth.user?.correo || "";

	const userInitials = getUserInitials(userName);

	const empresaLabel = auth.user?.empresaId
		? `Empresa ${auth.user.empresaId}`
		: "Panel de control";

	return (
		<div className="flex h-screen bg-slate-100 text-slate-900">
			{mobileNavOpen && (
				<div
					className="relative z-50 md:hidden"
					role="dialog"
					aria-modal="true"
				>
					<div
						className="fixed inset-0 bg-slate-900/25"
						onClick={() => setMobileNavOpen(false)}
					/>
					<div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
						<div className="flex w-full flex-col border-r border-slate-200 bg-white">
							<div className="flex items-center justify-between px-4 py-4">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-50 shadow-sm ring-1 ring-slate-900/10">
										<BuildingOffice2Icon className="h-5 w-5" />
									</div>
									<div className="min-w-0">
										<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
											Empresa
										</p>
										<p className="truncate text-sm font-semibold text-slate-900">
											{empresaLabel}
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => setMobileNavOpen(false)}
									className="inline-flex items-center rounded-full border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
								>
									<XMarkIcon className="h-5 w-5" />
								</button>
							</div>

							<nav className="mt-2 flex-1 space-y-6 overflow-y-auto px-3 pb-6">
								{visibleModulos.map((modulo) => (
									<div key={modulo.id}>
										<div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
											{modulo.nombre}
										</div>
										<div className="space-y-0.5">
											{renderMenuItems(
												modulo.menu,
												0,
												() => setMobileNavOpen(false)
											)}
										</div>
									</div>
								))}
								{visibleModulos.length === 0 && (
									<div className="px-3 text-xs text-slate-500">
										No hay opciones de menú disponibles para
										este usuario.
									</div>
								)}
							</nav>
						</div>
					</div>
				</div>
			)}

			<aside className="hidden h-full w-72 flex-col border-r border-slate-200 bg-white md:flex">
				<div className="px-4 pb-4 pt-5">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-50 shadow-sm ring-1 ring-slate-900/10">
							<BuildingOffice2Icon className="h-5 w-5" />
						</div>
						<div className="min-w-0">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								Empresa
							</p>
							<p className="truncate text-sm font-semibold text-slate-900">
								{empresaLabel}
							</p>
						</div>
					</div>
				</div>

				<div className="px-3 pt-2">
					<NavLink
						to="/dashboard"
						className={({ isActive }) =>
							`flex items-center rounded-xl px-2.5 py-2 text-sm font-medium ${
								isActive
									? "bg-slate-100 text-slate-900"
									: "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
							}`
						}
					>
						<span className="truncate">Dashboard</span>
					</NavLink>
				</div>

				<nav className="mt-4 flex-1 space-y-6 overflow-y-auto px-3 pb-6">
					{visibleModulos.map((modulo) => (
						<div key={modulo.id}>
							<div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
								{modulo.nombre}
							</div>
							<div className="space-y-0.5">
								{renderMenuItems(modulo.menu, 0)}
							</div>
						</div>
					))}
					{visibleModulos.length === 0 && (
						<div className="px-3 text-xs text-slate-500">
							No hay opciones de menú disponibles para este
							usuario.
						</div>
					)}
				</nav>

				<div className="border-t border-slate-200 px-4 py-4">
					<SidebarUserMenu
						initials={userInitials}
						name={userName}
						email={userEmail}
						onAccountClick={handleAccountClick}
						onLogoutClick={handleLogout}
					/>
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex items-center justify-between border-b border-slate-200 bg:white bg-white px-4 py-3 shadow-sm md:hidden">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setMobileNavOpen(true)}
							className="inline-flex items-center rounded-full border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
						>
							<Bars3Icon className="h-5 w-5" />
						</button>
						<p className="text-sm font-semibold text-slate-900">
							{empresaLabel}
						</p>
					</div>
					<HeaderUserMenu
						initials={userInitials}
						name={userName}
						email={userEmail}
						onAccountClick={handleAccountClick}
						onLogoutClick={handleLogout}
					/>
				</header>

				<main className="flex-1 overflow-y-auto">
					<div className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
						<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
							<div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
								<Outlet />
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};
