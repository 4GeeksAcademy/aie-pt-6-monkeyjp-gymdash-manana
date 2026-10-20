import { classes, memberships, monthlySummary } from "./data.js";
import { deriveDashboard, formatCurrency, formatNumber, formatPercent, formatSignedNumber } from "./dashboard.js";
import { createBarChart, createDataTable, createKpiCard } from "./components.js";

export const dashboardData = window.__DASHBOARD_TEST_DATA__ ?? { memberships, classes, monthlySummary };
export const filterState = { membership: "all", day: "all", occupancy: "all" };
export let dashboardView = deriveDashboard(dashboardData, filterState);

function renderKpis(view) {
	const grid = document.querySelector("#kpi-grid");
	grid.className = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
	grid.replaceChildren(
		createKpiCard({
			id: "kpi-active-members",
			label: "Socios activos",
			value: formatNumber(view.activeMembers),
			context: view.filters.membership === "all" ? "Todas las membresías" : "Membresía seleccionada",
			tone: "green",
		}),
		createKpiCard({
			id: "kpi-income",
			label: view.incomeLabel,
			value: formatCurrency(view.incomeCents),
			context: view.filters.membership === "all" ? "Mes de referencia, incluye otros ingresos" : "Importe mensual de la membresía seleccionada",
			tone: "teal",
		}),
		createKpiCard({
			id: "kpi-occupancy",
			label: "Ocupación de clases",
			value: formatPercent(view.occupancyPercent),
			context: `${formatNumber(view.classEnrolled)} inscritos de ${formatNumber(view.classCapacity)} plazas · ${view.filters.day === "all" && view.filters.occupancy === "all" ? "semana de referencia" : "clases filtradas"}`,
			tone: "gold",
		}),
		createKpiCard({
			id: "kpi-net-growth",
			label: "Crecimiento neto",
			value: formatSignedNumber(view.monthlySummary.netGrowth),
			context: `Global del mes · ${formatNumber(view.monthlySummary.newMembers)} altas · ${formatNumber(view.monthlySummary.cancellations)} bajas`,
			tone: "coral",
		}),
	);
}

function renderDrivers(view) {
	const grid = document.querySelector("#drivers-grid");
	grid.className = "grid grid-cols-1 gap-4 lg:grid-cols-3";
	const movement = document.createElement("div");
	const movementSummary = document.createElement("p");
	movementSummary.className = "mt-3 text-sm font-semibold text-slate-700";
	movementSummary.textContent = `Saldo neto global del mes: ${formatSignedNumber(view.monthlySummary.netGrowth)}`;
	movement.append(
		createBarChart({
			title: "Movimiento de socios · mes",
			items: [
				{ label: "Altas", value: view.monthlySummary.newMembers },
				{ label: "Bajas", value: view.monthlySummary.cancellations },
			],
			valueFormatter: formatNumber,
			maxValue: Math.max(view.monthlySummary.newMembers, view.monthlySummary.cancellations, 1),
		}),
		movementSummary,
	);
	grid.replaceChildren(
		createBarChart({
			title: "Ingresos por categoría",
			items: view.incomeCategories.map(({ id, label, valueCents }) => ({ id, label, value: valueCents })),
			valueFormatter: formatCurrency,
		}),
		movement,
		createBarChart({
			title: "Clases con más ocupación",
			items: view.topClasses.map((gymClass) => ({ label: gymClass.name, value: gymClass.occupancyPercent })),
			valueFormatter: formatPercent,
			maxValue: 100,
		}),
	);
}

function renderClassesTable(view) {
	const dayNames = { mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie" };
	const table = createDataTable({
		caption: "Horario de clases",
		columns: [
			{ key: "name", label: "Clase" },
			{ key: "capacity", label: "Aforo", align: "end" },
			{ key: "enrolled", label: "Inscritos", align: "end" },
			{ key: "occupancy", label: "Ocupación", align: "end" },
			{ key: "days", label: "Días" },
		],
		rows: view.classes.map((gymClass) => ({
			name: gymClass.isFull ? `${gymClass.name} · Completa` : gymClass.name,
			capacity: formatNumber(gymClass.capacity),
			enrolled: formatNumber(gymClass.enrolled),
			occupancy: formatPercent(gymClass.occupancyPercent),
			days: gymClass.days.map((day) => dayNames[day]).join(" / "),
		})),
		totals: {
			name: "Total visible",
			capacity: formatNumber(view.classCapacity),
			enrolled: formatNumber(view.classEnrolled),
			occupancy: formatPercent(view.occupancyPercent),
			days: "",
		},
	});
	return table;
}

function renderMembershipsTable(view) {
	return createDataTable({
		caption: "Tipos de membresía",
		columns: [
			{ key: "name", label: "Tipo" },
			{ key: "price", label: "Precio mensual", align: "end" },
			{ key: "members", label: "Socios activos", align: "end" },
			{ key: "revenue", label: "Ingresos", align: "end" },
		],
		rows: view.memberships.map((membership) => ({
			name: membership.name,
			price: formatCurrency(membership.monthlyPriceCents),
			members: formatNumber(membership.activeMembers),
			revenue: formatCurrency(membership.revenueCents),
		})),
		totals: {
			name: "Total visible",
			price: "",
			members: formatNumber(view.activeMembers),
			revenue: formatCurrency(view.membershipRevenueCents),
		},
	});
}

function renderOperations(view) {
	const grid = document.querySelector("#operations-grid");
	grid.className = "grid grid-cols-1 gap-6 xl:grid-cols-2";
	const tableRegions = [
		[renderClassesTable(view), "Horario de clases"],
		[renderMembershipsTable(view), "Tipos de membresía"],
	].map(([table, label]) => {
		const region = document.createElement("div");
		region.className = "min-w-0 max-w-full overflow-x-auto rounded-md border border-slate-200 bg-white p-3 sm:p-4";
		region.tabIndex = 0;
		region.setAttribute("role", "region");
		region.setAttribute("aria-label", label);
		region.append(table);
		return region;
	});
	grid.replaceChildren(...tableRegions);
}

function renderActiveFilters() {
	const labels = {
		membership: { all: "", basic: "Básica", standard: "Estándar", premium: "Premium" },
		day: { all: "", mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes" },
		occupancy: { all: "", available: "Con plazas", full: "Completas" },
	};
	const active = Object.entries(filterState)
		.filter(([key, value]) => value !== "all")
		.map(([key, value]) => `${key === "membership" ? "Membresía" : key === "day" ? "Día" : "Ocupación"}: ${labels[key][value]}`);
	document.querySelector("#active-filters").textContent = active.length ? `Filtros activos: ${active.join(" · ")}` : "Filtros activos: ninguno";
}

function renderDashboard({ announce = false } = {}) {
	dashboardView = deriveDashboard(dashboardData, filterState);
	renderKpis(dashboardView);
	renderDrivers(dashboardView);
	renderOperations(dashboardView);
	renderActiveFilters();
	if (announce) {
		document.querySelector("#dashboard-status").textContent =
			`Resultados actualizados: ${formatNumber(dashboardView.activeMembers)} socios; ocupación ${formatPercent(dashboardView.occupancyPercent)}.`;
	}
}

for (const filterName of ["membership", "day", "occupancy"]) {
	document.querySelector(`#${filterName}-filter`).addEventListener("change", (event) => {
		filterState[filterName] = event.currentTarget.value;
		renderDashboard({ announce: true });
	});
}

document.querySelector("#reset-filters").addEventListener("click", () => {
	Object.assign(filterState, { membership: "all", day: "all", occupancy: "all" });
	document.querySelector("#membership-filter").value = "all";
	document.querySelector("#day-filter").value = "all";
	document.querySelector("#occupancy-filter").value = "all";
	renderDashboard({ announce: true });
});

renderDashboard();
