/*import axios, {
	AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosRequestHeaders,
	type AxiosResponse,
} from "axios";

let accessToken: string | null = null;
let isRefreshing = false;

type PendingRequest = {
	resolve: (value: AxiosResponse) => void;
	reject: (reason: unknown) => void;
	config: AxiosRequestConfig;
};

let pendingQueue: PendingRequest[] = [];

export const setAccessToken = (token: string | null) => {
	accessToken = token;
};

const client: AxiosInstance = axios.create({
	baseURL: "http://localhost:3000",
	withCredentials: true,
});

const processQueue = (error: unknown, token: string | null) => {
	pendingQueue.forEach(({ resolve, reject, config }) => {
		if (error) {
			reject(error);
			return;
		}

		if (token) {
			const headers = (config.headers ?? {}) as AxiosRequestHeaders;
			headers.Authorization = `Bearer ${token}`;
			config.headers = headers;
		}

		client(config)
			.then((response) => resolve(response))
			.catch((err) => reject(err));
	});

	pendingQueue = [];
};

client.interceptors.request.use((config) => {
	if (config.url) {
		config.url = addApiPrefixIfNeeded(config.url);
	}

	if (accessToken) {
		const headers = (config.headers ?? {}) as AxiosRequestHeaders;
		headers.Authorization = `Bearer ${accessToken}`;
		config.headers = headers;
	}

	return config;
});

client.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalConfig = error.config;

		if (!originalConfig) {
			return Promise.reject(error);
		}

		const url = originalConfig.url ?? "";

		if (url.includes("/auth/login") || url.includes("/auth/refresh")) {
			return Promise.reject(error);
		}

		if (error.response?.status !== 401) {
			return Promise.reject(error);
		}

		const originalWithRetry = originalConfig as AxiosRequestConfig & {
			_retry?: boolean;
		};

		if (originalWithRetry._retry) {
			return Promise.reject(error);
		}

		originalWithRetry._retry = true;

		if (isRefreshing) {
			return new Promise<AxiosResponse>((resolve, reject) => {
				pendingQueue.push({ resolve, reject, config: originalConfig });
			});
		}

		isRefreshing = true;

		try {
			const refreshResponse = await axios.post<{ accessToken?: string }>(
				"http://localhost:3000/auth/refresh",
				{},
				{ withCredentials: true }
			);

			const newToken = refreshResponse.data.accessToken ?? null;

			if (!newToken) {
				setAccessToken(null);
				processQueue(null, null);
				isRefreshing = false;
				return Promise.reject(error);
			}

			setAccessToken(newToken);
			processQueue(null, newToken);
			isRefreshing = false;

			const headers = (originalConfig.headers ??
				{}) as AxiosRequestHeaders;
			headers.Authorization = `Bearer ${newToken}`;
			originalConfig.headers = headers;

			return client(originalConfig);
		} catch (refreshError) {
			setAccessToken(null);
			processQueue(refreshError, null);
			isRefreshing = false;
			return Promise.reject(refreshError);
		}
	}
);

const addApiPrefixIfNeeded = (url: string): string => {
	if (!url) return url;
	if (url.startsWith("http")) return url;
	if (url.startsWith("/auth")) return url;
	if (url.startsWith("/api")) return url;
	if (url.startsWith("/")) return `/api${url}`;
	return `/api/${url}`;
};

export const http = client;
*/

import axios, {
	AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosRequestHeaders,
	type AxiosResponse,
} from "axios";

let accessToken: string | null = null;
let isRefreshing = false;

type PendingRequest = {
	resolve: (value: AxiosResponse) => void;
	reject: (reason: unknown) => void;
	config: AxiosRequestConfig;
};

let pendingQueue: PendingRequest[] = [];

export const setAccessToken = (token: string | null) => {
	accessToken = token;
};

const client: AxiosInstance = axios.create({
	baseURL: "http://localhost:3000",
	withCredentials: true,
});

const addApiPrefixIfNeeded = (url: string): string => {
	if (!url) return url;
	if (url.startsWith("http")) return url;
	if (url.startsWith("/auth")) return url;
	if (url.startsWith("/api")) return url;
	if (url.startsWith("/")) return `/api${url}`;
	return `/api/${url}`;
};

const processQueue = (error: unknown, token: string | null) => {
	pendingQueue.forEach(({ resolve, reject, config }) => {
		if (error) {
			reject(error);
			return;
		}

		if (token) {
			const headers = (config.headers ?? {}) as AxiosRequestHeaders;
			headers.Authorization = `Bearer ${token}`;
			config.headers = headers;
		}

		client(config)
			.then((response) => resolve(response))
			.catch((err) => reject(err));
	});

	pendingQueue = [];
};

const handleSessionExpired = (error: unknown) => {
	setAccessToken(null);
	if (typeof window !== "undefined") {
		window.localStorage.removeItem("authState");
		window.location.href = "/login";
	}
	processQueue(error, null);
	isRefreshing = false;
};

client.interceptors.request.use((config) => {
	if (config.url) {
		config.url = addApiPrefixIfNeeded(config.url);
	}

	if (accessToken) {
		const headers = (config.headers ?? {}) as AxiosRequestHeaders;
		headers.Authorization = `Bearer ${accessToken}`;
		config.headers = headers;
	}

	return config;
});

client.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalConfig = error.config;

		if (!originalConfig) {
			return Promise.reject(error);
		}

		const url = originalConfig.url ?? "";

		// No intentes refrescar si el error viene del login o del refresh
		if (url.includes("/auth/login") || url.includes("/auth/refresh")) {
			return Promise.reject(error);
		}

		// Si no es 401, se deja pasar normal al catch del caller
		if (error.response?.status !== 401) {
			return Promise.reject(error);
		}

		const originalWithRetry = originalConfig as AxiosRequestConfig & {
			_retry?: boolean;
		};

		// Evita bucles infinitos
		if (originalWithRetry._retry) {
			return Promise.reject(error);
		}

		originalWithRetry._retry = true;

		// Si ya hay un refresh en curso, encola esta request
		if (isRefreshing) {
			return new Promise<AxiosResponse>((resolve, reject) => {
				pendingQueue.push({ resolve, reject, config: originalConfig });
			});
		}

		isRefreshing = true;

		try {
			const refreshResponse = await axios.post<{ accessToken?: string }>(
				"http://localhost:3000/auth/refresh",
				{},
				{ withCredentials: true }
			);

			const newToken = refreshResponse.data.accessToken ?? null;

			// Si el backend no devuelve nuevo token, la sesión está muerta → login
			if (!newToken) {
				handleSessionExpired(error);
				return Promise.reject(error);
			}

			setAccessToken(newToken);
			processQueue(null, newToken);
			isRefreshing = false;

			const headers = (originalConfig.headers ??
				{}) as AxiosRequestHeaders;
			headers.Authorization = `Bearer ${newToken}`;
			originalConfig.headers = headers;

			return client(originalConfig);
		} catch (refreshError) {
			// Refresh falló definitivamente → limpiar todo y mandar a login
			handleSessionExpired(refreshError);
			return Promise.reject(refreshError);
		}
	}
);

export const http = client;
