import { createContext } from "react";

export const SidebarContext = createContext({
    collapsed: false,
    toggleCollapse: () => {},
});
