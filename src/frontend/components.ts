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
    EditLetterModal: componentLoader.add(
        "EditLetterModal",
        "./components/Letters/EditLetterModal"
    ),
    ShowLetterModal: componentLoader.add(
        "ShowLetterModal",
        "./components/Letters/ShowLetterModal"
    ),
    EditLetterTypeModal: componentLoader.add(
        "EditLetterTypeModal",
        "./components/LetterTypes/EditLetterTypeModal"
    ),
    Sidebar: componentLoader.override(
        "Sidebar",
        "./components/Sidebar/Sidebar"
    ),
    TopBar: componentLoader.override("TopBar", "./components/TopBar/TopBar"),
    Comparison: componentLoader.add(
        "Comparison",
        "./components/Comparison/Comparison"
    ),
    SingleCommentInList: componentLoader.add(
        "SingleCommentInList",
        "./components/Comments/SingleCommentInList"
    ),
    ImportComponentNew: componentLoader.add(
        "ImportComponentNew",
        "./components/ImportExportComponent/ImportComponent"
    ),
    LoggedIn: componentLoader.override(
        "LoggedIn",
        "./components/LoggedIn/LoggedIn"
    ),
    UserEditAction: componentLoader.add(
        "UserEditAction",
        "./components/UserEditAction/UserEditAction"
    ),
    LanguageShow: componentLoader.add(
        "LanguageShow",
        "./components/LanguageShow/LanguageShow"
    ),
    RecordInList: componentLoader.override(
        "RecordInList",
        "./components/RecordInList/record-in-list"
    ),
    DefaultListAction: componentLoader.override(
        "DefaultListAction",
        "./components/List/List"
    ),
    LettersInList: componentLoader.add(
        "LettersInList",
        "./components/Letters/LettersInList"
    ),
    LanguageTileList: componentLoader.add(
        "LanguageTileList",
        "./components/Letters/LanguageTileList"
    ),
    LetterTypeInFilter: componentLoader.add(
        "LetterTypeInFilter",
        "./components/LetterTypeInFilter/LetterTypeInFilter"
    ),
    LetterTypeStatus: componentLoader.add(
        "LetterTypeStatus",
        "./components/LetterTypeStatus/LetterTypeStatus"
    ),
    LanguageCards: componentLoader.add(
        "LanguageCards",
        "./components/LanguageCards/LanguageCards"
    ),
    ProfilePage: componentLoader.add(
        "ProfilePage",
        "./components/Profile/ProfilePage"
    ),
    BookThumbnail: componentLoader.add(
        "BookThumbnail",
        "./components/BookThumbnail/BookThumbnail"
    ),
    PermissionMatrix: componentLoader.add(
        "PermissionMatrix",
        "./components/PermissionMatrix/PermissionMatrix"
    ),
    AdminTools: componentLoader.add(
        "AdminTools",
        "./components/AdminTools/AdminTools"
    ),
};

export { componentLoader, Components };
