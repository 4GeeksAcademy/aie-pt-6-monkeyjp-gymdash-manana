import { expect, test as base } from "@playwright/test";

const test = base.extend({
    page: async ({ page }, use) => {
        const runtimeErrors = [];
        page.on("pageerror", (error) => runtimeErrors.push(error.message));
        await use(page);
        expect(runtimeErrors).toEqual([]);
    },
});

test("muestra los indicadores principales con valores accesibles", async ({ page }) => {
    await page.goto("/");

    const members = page.getByRole("heading", { name: "Socios activos" }).locator("..");
    const income = page.getByRole("heading", { name: "Ingresos mensuales" }).locator("..");
    const occupancy = page.getByRole("heading", { name: "Ocupación de clases" }).locator("..");
    const growth = page.getByRole("heading", { name: "Crecimiento neto" }).locator("..");

    await expect(members).toContainText("245");
    await expect(income).toContainText("12.745");
    await expect(occupancy).toContainText(/84,6\s*%/);
    await expect(growth).toContainText("+13");
    await expect(growth).toContainText("Global del mes");
});

test("los indicadores caben en un viewport de 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Socios activos" })).toBeVisible();
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(320);
});

test("muestra ceros y ocupación sin datos con un conjunto alternativo", async ({ page }) => {
    await page.addInitScript(() => {
        window.__DASHBOARD_TEST_DATA__ = {
            memberships: [],
            classes: [],
            monthlySummary: { newMembers: 0, cancellations: 0, otherIncomeCents: 0 },
        };
    });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Socios activos" }).locator("..")).toContainText("0");
    await expect(page.getByRole("heading", { name: "Ingresos mensuales" }).locator("..")).toContainText("0");
    await expect(page.getByRole("heading", { name: "Ocupación de clases" }).locator("..")).toContainText("Sin datos");
    await expect(page.getByRole("heading", { name: "Crecimiento neto" }).locator("..")).toContainText("+0");
});

test("desglosa ingresos y prioriza las clases con mayor ocupación", async ({ page }) => {
    await page.goto("/");

    const incomeChart = page.getByRole("figure", { name: "Ingresos por categoría" });
    await expect(incomeChart).toContainText("Básica");
    await expect(incomeChart).toContainText("2.465");
    await expect(incomeChart).toContainText("Estándar");
    await expect(incomeChart).toContainText("5.880");
    await expect(incomeChart).toContainText("Premium");
    await expect(incomeChart).toContainText("3.160");
    await expect(incomeChart).toContainText("Otros ingresos");
    await expect(incomeChart).toContainText("1.240");

    const ranking = page.getByRole("figure", { name: "Clases con más ocupación" });
    const rows = await ranking.locator("li").allTextContents();
    expect(rows[0]).toContain("HIIT");
    expect(rows[0]).toContain("100");
    expect(rows[1]).toContain("Pilates");
    expect(rows[1]).toContain("100");
    expect(rows[2]).toContain("Yoga Matinal");
    expect(rows[2]).toContain("93,3");
});

test("las barras respetan la escala y muestran estados vacíos y valores cero", async ({ page }) => {
    await page.goto("/");

    const ranking = page.getByRole("figure", { name: "Clases con más ocupación" });
    const widths = await ranking.locator('li > span[aria-hidden="true"] > span').evaluateAll((bars) =>
        bars.map((bar) => bar.style.width),
    );
    expect(widths.slice(0, 2)).toEqual(["100%", "100%"]);
    expect(Number.parseFloat(widths[2])).toBeCloseTo(93.333, 2);
    for (const width of widths) {
        expect(Number.parseFloat(width)).toBeLessThanOrEqual(100);
    }

    await page.addInitScript(() => {
        window.__DASHBOARD_TEST_DATA__ = {
            memberships: [],
            classes: [],
            monthlySummary: { newMembers: 0, cancellations: 0, otherIncomeCents: 0 },
        };
    });
    await page.reload();
    const emptyRanking = page.getByRole("figure", { name: "Clases con más ocupación" });
    await expect(emptyRanking).toContainText("Sin datos para los filtros seleccionados.");
    await expect(page.getByRole("figure", { name: "Ingresos por categoría" })).toContainText("0");
    await expect(page.getByRole("figure", { name: "Movimiento de socios · mes" })).toContainText("Altas");
});

test("las tablas operativas incluyen filas, estados y totales correctos", async ({ page }) => {
    await page.goto("/");

    const classesTable = page.getByRole("table", { name: "Horario de clases" });
    await expect(classesTable.locator("tbody tr")).toHaveCount(4);
    await expect(classesTable).toContainText("65");
    await expect(classesTable).toContainText("55");
    await expect(classesTable).toContainText("84,6");
    await expect(classesTable).toContainText("HIIT · Completa");
    await expect(classesTable).toContainText("Pilates · Completa");

    const membershipsTable = page.getByRole("table", { name: "Tipos de membresía" });
    await expect(membershipsTable.locator("tbody tr")).toHaveCount(3);
    await expect(membershipsTable).toContainText("245");
    await expect(membershipsTable).toContainText("11.505");
    await expect(membershipsTable).not.toContainText("1.240");
});

test("las tablas se desplazan dentro de su región en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");

    const region = page.getByRole("region", { name: "Horario de clases" });
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute("tabindex", "0");
    const dimensions = await region.evaluate((node) => ({ client: node.clientWidth, scroll: node.scrollWidth }));
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    expect(dimensions.scroll).toBeGreaterThan(dimensions.client);
    expect(pageWidth).toBeLessThanOrEqual(320);
});

test("las tablas reemplazan las filas previas por estados vacíos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("table", { name: "Horario de clases" }).locator("tbody tr")).toHaveCount(4);

    await page.addInitScript(() => {
        window.__DASHBOARD_TEST_DATA__ = {
            memberships: [],
            classes: [],
            monthlySummary: { newMembers: 0, cancellations: 0, otherIncomeCents: 0 },
        };
    });
    await page.reload();

    const classesTable = page.getByRole("table", { name: "Horario de clases" });
    const membershipsTable = page.getByRole("table", { name: "Tipos de membresía" });
    await expect(classesTable.locator("tbody tr")).toHaveCount(1);
    await expect(membershipsTable.locator("tbody tr")).toHaveCount(1);
    await expect(classesTable).toContainText("Sin registros para los filtros seleccionados.");
    await expect(membershipsTable).toContainText("Sin registros para los filtros seleccionados.");
    await expect(classesTable).not.toContainText("Yoga Matinal");
    await expect(membershipsTable).not.toContainText("Básica");
});

test("el filtro de membresía excluye otros ingresos del KPI", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Tipo de membresía").selectOption("premium");

    await expect(page.getByRole("heading", { name: "Socios activos" }).locator("..")).toContainText("40");
    const income = page.getByRole("heading", { name: "Ingresos de la membresía" }).locator("..");
    await expect(income).toContainText("3.160");
    await expect(income).not.toContainText("1.240");
    const incomeChart = page.getByRole("figure", { name: "Ingresos por categoría" });
    await expect(incomeChart).toContainText("Premium");
    await expect(incomeChart).toContainText("3.160");
    await expect(incomeChart).not.toContainText("Otros ingresos");
    const membershipsTable = page.getByRole("table", { name: "Tipos de membresía" });
    await expect(membershipsTable.locator("tbody tr")).toHaveCount(1);
    await expect(membershipsTable).toContainText("79");
    await expect(membershipsTable).toContainText("40");
    await expect(membershipsTable).toContainText("3.160");
});

test("los filtros de día actualizan la ocupación y las clases visibles", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Día de clase").selectOption("mon");

    const classesTable = page.getByRole("table", { name: "Horario de clases" });
    await expect(classesTable.locator("tbody tr")).toHaveCount(2);
    await expect(classesTable).toContainText("Yoga Matinal");
    await expect(classesTable).toContainText("Spinning");
    await expect(page.getByRole("heading", { name: "Ocupación de clases" }).locator("..")).toContainText(/69,7\s*%/);
    await expect(page.getByRole("figure", { name: "Clases con más ocupación" }).locator("li")).toHaveCount(2);
});

test("el filtro de clases completas muestra aforo ocupado al cien por cien", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Ocupación de clases" }).selectOption("full");

    const classesTable = page.getByRole("table", { name: "Horario de clases" });
    await expect(classesTable.locator("tbody tr")).toHaveCount(2);
    await expect(classesTable).toContainText("HIIT · Completa");
    await expect(classesTable).toContainText("Pilates · Completa");
    await expect(classesTable.locator("tfoot")).toContainText(/100\s*%/);
    await expect(page.getByRole("heading", { name: "Ocupación de clases" }).locator("..")).toContainText(/100\s*%/);
});

test("lunes combinado con clases completas muestra todos los estados vacíos", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Día de clase" }).selectOption("mon");
    await page.getByRole("combobox", { name: "Ocupación de clases" }).selectOption("full");

    const classesTable = page.getByRole("table", { name: "Horario de clases" });
    const ranking = page.getByRole("figure", { name: "Clases con más ocupación" });
    await expect(classesTable.locator("tbody tr")).toHaveCount(1);
    await expect(classesTable).toContainText("Sin registros para los filtros seleccionados.");
    await expect(ranking.locator("li")).toHaveCount(1);
    await expect(ranking).toContainText("Sin datos para los filtros seleccionados.");
    await expect(page.getByRole("heading", { name: "Ocupación de clases" }).locator("..")).toContainText("Sin datos");
});

test("restablecer filtros recupera exactamente la vista inicial", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Tipo de membresía" }).selectOption("premium");
    await page.getByRole("combobox", { name: "Día de clase" }).selectOption("mon");
    await page.getByRole("combobox", { name: "Ocupación de clases" }).selectOption("full");
    await page.getByRole("button", { name: "Restablecer filtros" }).click();

    await expect(page.getByRole("combobox", { name: "Tipo de membresía" })).toHaveValue("all");
    await expect(page.getByRole("combobox", { name: "Día de clase" })).toHaveValue("all");
    await expect(page.getByRole("combobox", { name: "Ocupación de clases" })).toHaveValue("all");
    await expect(page.locator("#active-filters")).toHaveText("Filtros activos: ninguno");
    await expect(page.getByRole("heading", { name: "Socios activos" }).locator("..")).toContainText("245");
    await expect(page.getByRole("heading", { name: "Ingresos mensuales" }).locator("..")).toContainText("12.745");
    await expect(page.getByRole("table", { name: "Horario de clases" }).locator("tbody tr")).toHaveCount(4);
    await expect(page.getByRole("table", { name: "Tipos de membresía" }).locator("tbody tr")).toHaveCount(3);
    await expect(page.getByRole("figure", { name: "Clases con más ocupación" }).locator("li")).toHaveCount(3);
});

test("los filtros actualizan sin recargar ni mezclar resultados anteriores", async ({ page }) => {
    let documentRequests = 0;
    page.on("request", (request) => {
        if (request.isNavigationRequest() && request.resourceType() === "document") documentRequests += 1;
    });
    await page.goto("/");

    const membershipFilter = page.getByRole("combobox", { name: "Tipo de membresía" });
    await membershipFilter.selectOption("premium");
    const dayFilter = page.getByRole("combobox", { name: "Día de clase" });
    await dayFilter.focus();
    await dayFilter.selectOption("mon");

    await expect(dayFilter).toBeFocused();
    await expect(page.getByRole("heading", { name: "Socios activos" }).locator("..")).toContainText("40");
    await expect(page.getByRole("heading", { name: "Ingresos de la membresía" }).locator("..")).toContainText("3.160");
    await expect(page.getByRole("table", { name: "Tipos de membresía" }).locator("tbody tr")).toHaveCount(1);
    await expect(page.getByRole("table", { name: "Horario de clases" }).locator("tbody tr")).toHaveCount(2);
    expect(documentRequests).toBe(1);
});

test("casos límite de ocupación y empates se muestran sin valores inválidos", async ({ page }) => {
    await page.addInitScript(() => {
        window.__DASHBOARD_TEST_DATA__ = {
            memberships: [],
            classes: [
                { id: "zero-enrolled", name: "Sin inscritos", capacity: 10, enrolled: 0, days: ["mon"] },
                { id: "zero-capacity", name: "Sin aforo", capacity: 0, enrolled: 0, days: ["mon"] },
                { id: "tie-first", name: "Empate A", capacity: 4, enrolled: 3, days: ["mon"] },
                { id: "tie-second", name: "Empate B", capacity: 4, enrolled: 3, days: ["mon"] },
            ],
            monthlySummary: { newMembers: 0, cancellations: 0, otherIncomeCents: 0 },
        };
    });
    await page.goto("/");

    const classesTable = page.getByRole("table", { name: "Horario de clases" });
    await expect(classesTable.locator("tbody tr").nth(0)).toContainText("0");
    await expect(classesTable.locator("tbody tr").nth(1)).toContainText("Sin datos");
    await expect(classesTable).not.toContainText("NaN");
    await expect(classesTable).not.toContainText("Infinity");
    const rankingRows = await page.getByRole("figure", { name: "Clases con más ocupación" }).locator("li").allTextContents();
    expect(rankingRows[0]).toContain("Empate A");
    expect(rankingRows[1]).toContain("Empate B");
    expect(rankingRows[2]).toContain("Sin inscritos");
});

test("Tailwind CDN aplica las utilidades de layout y tipografía", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => page.locator("#kpi-grid").evaluate((node) => getComputedStyle(node).display)).toBe("grid");
    await expect.poll(() => page.locator("h1").evaluate((node) => getComputedStyle(node).fontSize)).toBe("24px");
});

test("filtros y estados vacíos no desbordan en los anchos objetivo", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Día de clase" }).selectOption("mon");
    await page.getByRole("combobox", { name: "Ocupación de clases" }).selectOption("full");

    for (const width of [320, 375, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(page.getByRole("combobox", { name: "Día de clase" })).toBeVisible();
        const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(pageWidth).toBeLessThanOrEqual(width);
    }
});

test("solo las regiones de tablas permiten scroll horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");

    for (const label of ["Horario de clases", "Tipos de membresía"]) {
        const region = page.getByRole("region", { name: label });
        const dimensions = await region.evaluate((node) => ({ client: node.clientWidth, scroll: node.scrollWidth }));
        expect(dimensions.scroll).toBeGreaterThan(dimensions.client);
    }
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(320);
});

test("los filtros y regiones de tablas son accesibles mediante teclado", async ({ page }) => {
    await page.goto("/");
    const membership = page.getByRole("combobox", { name: "Tipo de membresía" });
    const day = page.getByRole("combobox", { name: "Día de clase" });
    const occupancy = page.getByRole("combobox", { name: "Ocupación de clases" });
    const reset = page.getByRole("button", { name: "Restablecer filtros" });

    await page.keyboard.press("Tab");
    await expect(membership).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(day).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(occupancy).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(reset).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("region", { name: "Horario de clases" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("region", { name: "Tipos de membresía" })).toBeFocused();

    await expect(page.getByRole("columnheader", { name: "Clase" })).toHaveAttribute("scope", "col");
    await expect(page.getByRole("columnheader", { name: "Ingresos" })).toHaveAttribute("scope", "col");
});

test("controles táctiles alcanzan 44 px y el texto supera contraste AA", async ({ page }) => {
    await page.goto("/");
    const measurements = await page.evaluate(() => {
        const controls = [...document.querySelectorAll("select, button")].map((node) => {
            const rect = node.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        });
        const text = document.querySelector("#kpi-grid article p:last-child");
        const card = text.closest("article");
        return { controls, foreground: getComputedStyle(text).color, background: getComputedStyle(card).backgroundColor };
    });
    for (const control of measurements.controls) {
        expect(control.width).toBeGreaterThanOrEqual(44);
        expect(control.height).toBeGreaterThanOrEqual(44);
    }

    const channels = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => value / 255);
    const luminance = (color) => {
        const [red, green, blue] = channels(color).map((value) =>
            value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
        );
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const values = [luminance(measurements.foreground), luminance(measurements.background)].sort((a, b) => b - a);
    expect((values[0] + 0.05) / (values[1] + 0.05)).toBeGreaterThanOrEqual(4.5);
});

test("la interfaz sigue utilizable con escala 200 % y viewport reducido", async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 900 });
    await page.goto("/");
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });

    const browserMetrics = await page.evaluate(() => ({ width: window.innerWidth, scale: window.visualViewport.scale }));
    expect(browserMetrics.scale).toBe(2);
    await expect(page.getByRole("combobox", { name: "Tipo de membresía" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Horario de clases" })).toBeVisible();
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(browserMetrics.width);
});

test("respeta la preferencia de movimiento reducido", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const motionPreference = await page.evaluate(() => ({
        matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
        animationDuration: getComputedStyle(document.querySelector("#kpi-grid article")).animationDuration,
    }));
    expect(motionPreference.matches).toBe(true);
    expect(Number.parseFloat(motionPreference.animationDuration)).toBeLessThanOrEqual(0.001);
});

test("los filtros conservan independientes membresías, clases y movimiento global", async ({ page }) => {
    await page.goto("/");
    const movement = page.getByRole("figure", { name: "Movimiento de socios · mes" });
    const movementBefore = await movement.innerText();
    const classesTable = page.getByRole("table", { name: "Horario de clases" });

    await page.getByLabel("Tipo de membresía").selectOption("premium");
    await expect(classesTable.locator("tbody tr")).toHaveCount(4);
    expect((await movement.innerText()).replace(/\s+/g, " ")).toBe(movementBefore.replace(/\s+/g, " "));

    await page.getByLabel("Día de clase").selectOption("mon");
    await expect(classesTable.locator("tbody tr")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Ingresos de la membresía" }).locator("..")).toContainText("3.160");
    expect((await movement.innerText()).replace(/\s+/g, " ")).toBe(movementBefore.replace(/\s+/g, " "));
});

test("el foco permanece en el selector al actualizar resultados", async ({ page }) => {
    await page.goto("/");
    const membershipFilter = page.getByLabel("Tipo de membresía");
    await membershipFilter.focus();
    await membershipFilter.selectOption("premium");

    await expect(membershipFilter).toBeFocused();
    await expect(page.getByRole("heading", { name: "Socios activos" }).locator("..")).toContainText("40");
    const status = page.getByRole("status");
    await expect(status).toHaveCount(1);
    await expect(status).toHaveText("Resultados actualizados: 40 socios; ocupación 84,6 %.");
});

test("un conjunto sin clases muestra ocupación y bloques vacíos", async ({ page }) => {
    await page.addInitScript(() => {
        window.__DASHBOARD_TEST_DATA__ = {
            memberships: [],
            classes: [],
            monthlySummary: { newMembers: 0, cancellations: 0, otherIncomeCents: 0 },
        };
    });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Ocupación de clases" }).locator("..")).toContainText("Sin datos");
    await expect(page.getByRole("figure", { name: "Clases con más ocupación" })).toContainText("Sin datos para los filtros seleccionados.");
    await expect(page.getByRole("table", { name: "Horario de clases" })).toContainText("Sin registros para los filtros seleccionados.");
});
