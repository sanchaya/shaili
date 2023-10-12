import { ComponentLoader } from "adminjs";

const componentLoader = new ComponentLoader();

const Components = {
  Dashboard: componentLoader.add(
    "Dashboard",
    "./components/Dashboard/Dashboard"
  ),
  Login: componentLoader.override("Login", "./components/Login/Login"),
  SidebarResourceSection: componentLoader.override(
    "SidebarResourceSection",
    "./components/SidebarResources/SidebarResources"
  ),
};

export { componentLoader, Components };
