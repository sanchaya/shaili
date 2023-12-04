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
    AddLetter: componentLoader.add(
        "AddLetter",
        "./components/Letters/AddLetter"
    ),
    EditLetter: componentLoader.add(
        "EditLetter",
        "./components/Letters/EditLetter"
    ),
    Sidebar: componentLoader.override(
        "Sidebar",
        "./components/Sidebar/Sidebar"
    ),
    Comparison: componentLoader.add(
        "Comparison",
        "./components/Comparison/Comparison"
    ),
    SingleCommentInList: componentLoader.add(
        "SingleCommentInList",
        "./components/Comments/SingleCommentInList"
    ),
};

export { componentLoader, Components };
