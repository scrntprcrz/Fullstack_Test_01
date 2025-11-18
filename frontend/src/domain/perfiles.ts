export type MenuPermisos = {
	puedeVer: boolean;
	puedeCrear: boolean;
	puedeActualizar: boolean;
	puedeEliminar: boolean;
};

export type MenuOpcion = {
	id: number;
	opcionMenuIdPadre: number | null;
	codigo: string;
	etiqueta: string;
	ruta: string;
	icono: string;
	orden: number;
	permisos: MenuPermisos;
	children: MenuOpcion[];
};

export type MenuModulo = {
	id: number;
	codigo: string;
	nombre: string;
	icono: string;
	ruta: string;
	orden: number;
	menu: MenuOpcion[];
};

export type MenuConfig = MenuModulo[];

export type MenuSelectionMap = Record<string, boolean>;

export type PerfilItem = {
	id: number;
	empresaId: number;
	codigo: string;
	nombre: string;
	descripcion: string;
	esSistema: boolean;
	isActive: boolean;
	updatedAt: string;
};

export type PerfilesListResponse = {
	data: PerfilItem[];
	total: number;
	limit: number;
	offset: number;
};

export type PerfilDetalle = PerfilItem & {
	menuConfigJson: MenuConfig | null;
};

export type PerfilFormBase = {
	codigo: string;
	nombre: string;
	descripcion?: string;
	isActive: boolean;
	esSistema: boolean;
};

export const BASE_MENU_CONFIG: MenuConfig = [
	{
		id: 1,
		codigo: "ADMIN",
		nombre: "Administración",
		icono: "",
		ruta: "/admin",
		orden: 100,
		menu: [
			{
				id: 9,
				opcionMenuIdPadre: null,
				codigo: "ADMIN_PERFILES",
				etiqueta: "Perfiles",
				ruta: "/admin/perfiles",
				icono: "",
				orden: 8,
				permisos: {
					puedeVer: true,
					puedeCrear: true,
					puedeActualizar: true,
					puedeEliminar: true,
				},
				children: [],
			},
			{
				id: 23,
				opcionMenuIdPadre: null,
				codigo: "ADMIN_USUARIOS",
				etiqueta: "Usuarios",
				ruta: "/admin/usuarios",
				icono: "",
				orden: 10,
				permisos: {
					puedeVer: true,
					puedeCrear: true,
					puedeActualizar: true,
					puedeEliminar: true,
				},
				children: [],
			},
		],
	},
	{
		id: 2,
		codigo: "PROYECTOS",
		nombre: "Proyectos",
		icono: "",
		ruta: "/proyectos",
		orden: 200,
		menu: [
			{
				id: 3,
				opcionMenuIdPadre: null,
				codigo: "PROYECTOS",
				etiqueta: "Proyectos",
				ruta: "/proyectos/proyectos",
				icono: "",
				orden: 10,
				permisos: {
					puedeVer: true,
					puedeCrear: true,
					puedeActualizar: true,
					puedeEliminar: true,
				},
				children: [],
			},
			{
				id: 30,
				opcionMenuIdPadre: null,
				codigo: "TAREAS",
				etiqueta: "Tareas",
				ruta: "/proyectos/tareas",
				icono: "",
				orden: 11,
				permisos: {
					puedeVer: true,
					puedeCrear: true,
					puedeActualizar: true,
					puedeEliminar: true,
				},
				children: [],
			},
		],
	},
];

export const buildPerfilesListParams = (
	empresaId: number,
	limit: number,
	offset: number
) => ({
	empresaId,
	limit,
	offset,
});

export const buildPerfilCreatePayload = (
	values: PerfilFormBase,
	empresaId: number,
	menuConfigJson: MenuConfig | null
) => ({
	empresaId,
	codigo: values.codigo.trim(),
	nombre: values.nombre.trim(),
	descripcion: values.descripcion?.trim() ?? "",
	esSistema: values.esSistema,
	isActive: values.isActive,
	menuConfigJson,
});

export const buildPerfilUpdatePayload = (
	values: PerfilFormBase,
	empresaId: number,
	id: number,
	menuConfigJson: MenuConfig | null
) => ({
	id: String(id),
	empresaId,
	codigo: values.codigo.trim(),
	nombre: values.nombre.trim(),
	descripcion: values.descripcion?.trim() ?? "",
	esSistema: values.esSistema,
	isActive: values.isActive,
	menuConfigJson,
});

export const buildMenuSelectionFromBase = (
	config: MenuConfig,
	selected: boolean
): MenuSelectionMap => {
	const map: MenuSelectionMap = {};
	const visitOptions = (items: MenuOpcion[]) => {
		items.forEach((item) => {
			map[item.codigo] = selected;
			if (item.children && item.children.length > 0) {
				visitOptions(item.children);
			}
		});
	};
	config.forEach((modulo) => visitOptions(modulo.menu));
	return map;
};

export const buildEmptyMenuSelection = (config: MenuConfig) =>
	buildMenuSelectionFromBase(config, false);

export const buildFullMenuSelection = (config: MenuConfig) =>
	buildMenuSelectionFromBase(config, true);

export const buildMenuSelectionFromConfig = (
	config: MenuConfig | null | undefined
): MenuSelectionMap => {
	const base = buildEmptyMenuSelection(BASE_MENU_CONFIG);
	if (!Array.isArray(config)) return base;
	const selection: MenuSelectionMap = { ...base };

	const visitOptions = (items: MenuOpcion[]) => {
		items.forEach((item) => {
			const permisos = item.permisos;
			const selected =
				!!permisos &&
				(permisos.puedeVer ||
					permisos.puedeCrear ||
					permisos.puedeActualizar ||
					permisos.puedeEliminar);
			if (selected) {
				selection[item.codigo] = true;
			}
			if (item.children && item.children.length > 0) {
				visitOptions(item.children);
			}
		});
	};

	config.forEach((modulo) => visitOptions(modulo.menu ?? []));
	return selection;
};

export const buildMenuConfigFromSelection = (
	selection: MenuSelectionMap
): MenuConfig | null => {
	const selectedModules: MenuConfig = [];

	BASE_MENU_CONFIG.forEach((modulo) => {
		const selectedOptions: MenuOpcion[] = [];

		const cloneIfSelected = (item: MenuOpcion): MenuOpcion | null => {
			const isSelected = !!selection[item.codigo];
			if (!isSelected) return null;

			const selectedChildren: MenuOpcion[] = [];
			if (item.children && item.children.length > 0) {
				item.children.forEach((child) => {
					const clonedChild = cloneIfSelected(child);
					if (clonedChild) {
						selectedChildren.push(clonedChild);
					}
				});
			}

			return {
				...item,
				children: selectedChildren,
			};
		};

		modulo.menu.forEach((item) => {
			const cloned = cloneIfSelected(item);
			if (cloned) {
				selectedOptions.push(cloned);
			}
		});

		if (selectedOptions.length > 0) {
			selectedModules.push({
				...modulo,
				menu: selectedOptions,
			});
		}
	});

	if (selectedModules.length === 0) return null;
	return selectedModules;
};

export const formatDateTime = (value?: string | null) => {
	if (!value) return "-";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "-";
	return d.toLocaleString();
};
