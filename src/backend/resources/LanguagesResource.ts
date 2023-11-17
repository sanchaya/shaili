import { menu } from "../../common/menu.js";
import { ActionContext } from "adminjs";
import { Languages } from "../db/models/Languages.js";

const isAccessible = (context: ActionContext, role: number) => {
  const { currentAdmin } = context;
  return role === currentAdmin?.role;
};

export const LanguagesResource = {
  resource: Languages,
  options: {
    navigation: menu.Languages,
    editProperties: ["language", "language_code"],
    listProperties: ["language", "language_code"],
    showProperties: ["language", "language_code"],
    filterProperties: ["language", "language_code"],
    timestamps: true,
    actions: {
      list: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
      edit: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
      show: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
      delete: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
      new: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
      bulkDelete: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
    },
  },
};
