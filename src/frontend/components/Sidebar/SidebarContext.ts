let collapsed = false;
try {
    collapsed = localStorage.getItem("sidebar-collapsed") === "true";
} catch {}

let mobileOpen = false;

const listeners = new Set<() => void>();

function emitChange() {
    listeners.forEach((l) => l());
}

export function getSidebarCollapsed(): boolean {
    return collapsed;
}

export function toggleSidebar(): void {
    collapsed = !collapsed;
    try {
        localStorage.setItem("sidebar-collapsed", String(collapsed));
    } catch {}
    emitChange();
}

export function getMobileOverlayOpen(): boolean {
    return mobileOpen;
}

export function toggleMobileOverlay(): void {
    mobileOpen = !mobileOpen;
    emitChange();
}

export function closeMobileOverlay(): void {
    if (!mobileOpen) return;
    mobileOpen = false;
    emitChange();
}

export function subscribeSidebar(callback: () => void): () => void {
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
    };
}
