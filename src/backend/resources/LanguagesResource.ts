import { menu } from "../../common/menu.js";
import { ActionContext } from "adminjs";
import { Languages } from "../db/models/Languages.js";
import {
  LanguageCreateBefore,
  LanguageCreateHandler,
  LanguageDeleteBefore,
  LanguageDeleteHandler,
  LanguageEditBefore,
  LanguageEditHandler,
} from "../utils/LanguageResourceUtils.js";

const isAccessible = (context: ActionContext, role: number) => {
  const { currentAdmin } = context;
  return role === currentAdmin?.role;
};

const beforeLanguagesShowHook = (request, context) => {
  const { record } = context;
  const values = record.params;

  for (let key in values) {
    if (values[key] === "" || values[key] === null) {
      values[key] = "-";
    }
  }
  return context;
};

const afterLanguagesListHook = (response) => {
  response.records.forEach((record) => {
    record.params.alt_lang_code = record.params.alt_lang_code || "-";
    record.params.description = record.params.description || "-";
  });
  return response;
};

export const LanguagesResource = {
  resource: Languages,
  options: {
    navigation: menu.Languages,
    editProperties: [
      "language",
      "language_code",
      "alt_lang_code",
      "description",
    ],
    listProperties: [
      "language",
      "language_code",
      "alt_lang_code",
      "description",
    ],
    showProperties: [
      "language",
      "language_code",
      "alt_lang_code",
      "description",
    ],
    filterProperties: ["language", "language_code", "alt_lang_code"],
    actions: {
      bulkDelete: { isAccessible: false },
      list: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
        after: [afterLanguagesListHook],
      },
      new: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
        before: [LanguageCreateBefore],
        handler: [LanguageCreateHandler],
      },
      edit: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
        before: [LanguageEditBefore],
        handler: [LanguageEditHandler],
      },
      delete: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
        before: [LanguageDeleteBefore],
        handler: [LanguageDeleteHandler],
      },
      show: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
        before: [beforeLanguagesShowHook],
      },
    },
  },
};
