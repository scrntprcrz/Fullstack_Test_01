import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/index.scss";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider as JotaiProvider } from "jotai";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<JotaiProvider>
			<BrowserRouter>
				<App />
				<Toaster position="top-right" />
			</BrowserRouter>
		</JotaiProvider>
	</StrictMode>
);
