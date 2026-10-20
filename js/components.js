function element(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

export function createKpiCard({ id, label, value, context, tone = "green" }) {
    const tones = {
        green: "border-l-4 border-l-emerald-700",
        coral: "border-l-4 border-l-rose-700",
        gold: "border-l-4 border-l-amber-700",
        teal: "border-l-4 border-l-teal-700",
    };
    const card = element("article", `min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-sm ${tones[tone] ?? tones.green}`);
    const heading = element("h3", "text-sm font-medium text-slate-600", label);
    const metric = element("p", "mt-3 break-words text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl", value);
    const description = element("p", "mt-2 text-sm text-slate-600", context);

    if (id) heading.id = id;
    card.setAttribute("aria-labelledby", id || "");
    card.append(heading, metric, description);
    return card;
}

export function createBarChart({ title, items, valueFormatter, maxValue }) {
    const chart = element("figure", "rounded-md border border-slate-200 bg-white p-4 shadow-sm");
    const caption = element("figcaption", "text-base font-semibold", title);
    const list = element("ul", "mt-4 space-y-4");
    const calculatedMax = Math.max(0, ...items.map(({ value }) => value));
    const scale = maxValue ?? (calculatedMax > 0 ? calculatedMax : 1);

    if (items.length === 0) {
        list.append(element("li", "text-sm text-slate-600", "Sin datos para los filtros seleccionados."));
    }

    for (const item of items) {
        const row = element("li", "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2");
        const label = element("span", "min-w-0 break-words text-sm font-medium", item.label);
        const value = element("span", "text-sm font-semibold tabular-nums", valueFormatter(item.value));
        const track = element("span", "col-span-2 block h-2.5 overflow-hidden rounded-sm bg-slate-100");
        const bar = element("span", "block h-full rounded-sm bg-emerald-700");
        bar.style.width = `${Math.max(0, Math.min(100, (item.value / scale) * 100))}%`;
        track.setAttribute("aria-hidden", "true");
        track.append(bar);
        row.append(label, value, track);
        list.append(row);
    }

    chart.append(caption, list);
    return chart;
}

export function createDataTable({ caption, columns, rows, totals = null }) {
    const table = element("table", "min-w-full border-collapse text-left text-sm");
    const tableCaption = element("caption", "pb-3 text-left text-base font-semibold", caption);
    const head = element("thead", "border-b border-slate-300 bg-slate-50");
    const headerRow = element("tr");
    const body = element("tbody", "divide-y divide-slate-200");

    for (const column of columns) {
        const alignment = column.align === "end" ? "text-right tabular-nums" : "text-left";
        const header = element("th", `px-3 py-3 font-semibold text-slate-700 ${alignment}`, column.label);
        header.scope = "col";
        headerRow.append(header);
    }
    head.append(headerRow);

    if (rows.length === 0) {
        const row = element("tr");
        const emptyCell = element("td", "px-3 py-6 text-center text-slate-600", "Sin registros para los filtros seleccionados.");
        emptyCell.colSpan = columns.length;
        row.append(emptyCell);
        body.append(row);
    } else {
        for (const item of rows) {
            const row = element("tr", "bg-white");
            columns.forEach((column, index) => {
                const alignment = column.align === "end" ? "text-right tabular-nums" : "text-left";
                const cell = element(index === 0 ? "th" : "td", `px-3 py-3 text-slate-800 ${alignment}`, item[column.key] ?? "—");
                if (index === 0) cell.scope = "row";
                row.append(cell);
            });
            body.append(row);
        }
    }

    table.append(tableCaption, head, body);
    if (totals) {
        const foot = element("tfoot", "border-t-2 border-slate-300 bg-slate-50 font-semibold");
        const footerRow = element("tr");
        columns.forEach((column, index) => {
            const alignment = column.align === "end" ? "text-right tabular-nums" : "text-left";
            const cell = element(index === 0 ? "th" : "td", `px-3 py-3 text-slate-800 ${alignment}`, totals[column.key] ?? "");
            if (index === 0) cell.scope = "row";
            footerRow.append(cell);
        });
        foot.append(footerRow);
        table.append(foot);
    }
    return table;
}