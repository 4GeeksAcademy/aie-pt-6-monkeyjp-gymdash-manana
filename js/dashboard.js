export function membershipRevenueCents(membership) {
    return membership.monthlyPriceCents * membership.activeMembers;
}

export function sumActiveMembers(memberships) {
    return memberships.reduce((total, membership) => total + membership.activeMembers, 0);
}

export function sumMembershipRevenueCents(memberships) {
    return memberships.reduce((total, membership) => total + membershipRevenueCents(membership), 0);
}

export function totalIncomeCents(memberships, otherIncomeCents = 0) {
    return sumMembershipRevenueCents(memberships) + otherIncomeCents;
}

export function netMemberGrowth(summary) {
    return summary.newMembers - summary.cancellations;
}

export function classOccupancyPercent(gymClass) {
    return gymClass.capacity > 0 ? (gymClass.enrolled / gymClass.capacity) * 100 : null;
}

export function aggregateOccupancyPercent(classes) {
    const capacity = classes.reduce((total, gymClass) => total + gymClass.capacity, 0);
    if (capacity <= 0) return null;

    const enrolled = classes.reduce((total, gymClass) => total + gymClass.enrolled, 0);
    return (enrolled / capacity) * 100;
}

export function filterMemberships(memberships, membershipId = "all") {
    return membershipId === "all" ? [...memberships] : memberships.filter(({ id }) => id === membershipId);
}

export function filterClasses(classes, { day = "all", occupancy = "all" } = {}) {
    return classes.filter((gymClass) => {
        const matchesDay = day === "all" || gymClass.days.includes(day);
        const matchesOccupancy =
            occupancy === "all" ||
            (occupancy === "available" && gymClass.enrolled < gymClass.capacity) ||
            (occupancy === "full" && gymClass.enrolled >= gymClass.capacity);
        return matchesDay && matchesOccupancy;
    });
}

export function topOccupiedClasses(classes, limit = 3) {
    return classes
        .map((gymClass, index) => ({ gymClass, index, occupancy: classOccupancyPercent(gymClass) }))
        .filter(({ occupancy }) => occupancy !== null)
        .sort((left, right) => right.occupancy - left.occupancy || left.index - right.index)
        .slice(0, limit)
        .map(({ gymClass, occupancy }) => ({ ...gymClass, occupancyPercent: occupancy }));
}

const currencyFormatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    useGrouping: true,
});
const numberFormatter = new Intl.NumberFormat("es-ES");
const signedNumberFormatter = new Intl.NumberFormat("es-ES", { signDisplay: "always" });
const percentFormatter = new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 1 });

export function formatCurrency(cents) {
    return currencyFormatter.format(cents / 100);
}

export function formatNumber(value) {
    return numberFormatter.format(value);
}

export function formatSignedNumber(value) {
    return signedNumberFormatter.format(value);
}

export function formatPercent(value) {
    return value === null ? "Sin datos" : percentFormatter.format(value / 100);
}

export function deriveDashboard(data, filters = {}) {
    const activeFilters = { membership: "all", day: "all", occupancy: "all", ...filters };
    const visibleMemberships = filterMemberships(data.memberships, activeFilters.membership);
    const visibleClasses = filterClasses(data.classes, activeFilters);
    const membershipRevenue = sumMembershipRevenueCents(visibleMemberships);
    const includeOtherIncome = activeFilters.membership === "all";
    const otherIncome = includeOtherIncome ? data.monthlySummary.otherIncomeCents : 0;
    const capacity = visibleClasses.reduce((total, gymClass) => total + gymClass.capacity, 0);
    const enrolled = visibleClasses.reduce((total, gymClass) => total + gymClass.enrolled, 0);

    return {
        filters: activeFilters,
        memberships: visibleMemberships.map((membership) => ({
            ...membership,
            revenueCents: membershipRevenueCents(membership),
        })),
        classes: visibleClasses.map((gymClass) => ({
            ...gymClass,
            occupancyPercent: classOccupancyPercent(gymClass),
            isFull: gymClass.capacity > 0 && gymClass.enrolled >= gymClass.capacity,
        })),
        activeMembers: sumActiveMembers(visibleMemberships),
        membershipRevenueCents: membershipRevenue,
        otherIncomeCents: otherIncome,
        incomeCents: totalIncomeCents(visibleMemberships, otherIncome),
        incomeLabel: includeOtherIncome ? "Ingresos mensuales" : "Ingresos de la membresía",
        incomeCategories: [
            ...visibleMemberships.map((membership) => ({
                id: membership.id,
                label: membership.name,
                valueCents: membershipRevenueCents(membership),
            })),
            ...(includeOtherIncome ? [{ id: "other", label: "Otros ingresos", valueCents: otherIncome }] : []),
        ],
        classCapacity: capacity,
        classEnrolled: enrolled,
        occupancyPercent: aggregateOccupancyPercent(visibleClasses),
        topClasses: topOccupiedClasses(visibleClasses),
        monthlySummary: {
            ...data.monthlySummary,
            netGrowth: netMemberGrowth(data.monthlySummary),
        },
    };
}
