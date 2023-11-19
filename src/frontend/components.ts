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
  ViewBook: componentLoader.add("ViewBook", "./components/ViewBook/ViewBook"),
  AddLetter: componentLoader.add("AddLetter", "./components/Letters/AddLetter"),
  EditLetter: componentLoader.add(
    "EditLetter",
    "./components/Letters/EditLetter"
  ),
};

export { componentLoader, Components };
