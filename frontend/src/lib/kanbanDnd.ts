import interact from "interactjs";
import { type TareaEstado } from "../domain/tareas";

type InteractDragMoveEvent = {
	target: HTMLElement;
	dx: number;
	dy: number;
};

type InteractDragEndEvent = {
	target: HTMLElement;
};

type InteractDropEvent = {
	relatedTarget: HTMLElement;
	target: HTMLElement;
};

export const initKanbanDnD = (
	onDrop: (tareaId: number, nuevoEstado: TareaEstado) => void
) => {
	const draggable = interact(".kanban-card").draggable({
		inertia: false,
		autoScroll: true,
		listeners: {
			move(event: InteractDragMoveEvent) {
				const target = event.target;
				const prevX =
					parseFloat(target.getAttribute("data-x") || "0") || 0;
				const prevY =
					parseFloat(target.getAttribute("data-y") || "0") || 0;
				const x = prevX + event.dx;
				const y = prevY + event.dy;
				target.style.transform = `translate(${x}px, ${y}px)`;
				target.setAttribute("data-x", String(x));
				target.setAttribute("data-y", String(y));
			},
			end(event: InteractDragEndEvent) {
				const target = event.target;
				target.style.transform = "";
				target.removeAttribute("data-x");
				target.removeAttribute("data-y");
			},
		},
	});

	const dropzones = interact(".kanban-column").dropzone({
		overlap: 0.25,
		ondrop(event: InteractDropEvent) {
			const card = event.relatedTarget;
			const column = event.target;
			const idAttr = card.getAttribute("data-id");
			const estadoAttr = column.getAttribute(
				"data-estado"
			) as TareaEstado | null;
			if (!idAttr || !estadoAttr) return;
			const tareaId = Number(idAttr);
			if (Number.isNaN(tareaId)) return;
			onDrop(tareaId, estadoAttr);
		},
	});

	return () => {
		draggable.unset();
		dropzones.unset();
	};
};
