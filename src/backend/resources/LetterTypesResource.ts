import { menu } from "../../common/menu.js";
import { ActionContext } from "adminjs";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Languages } from "../db/models/Languages.js";

const isAccessible = (context: ActionContext, role: number) => {
  const { currentAdmin } = context;
  return role === currentAdmin?.role;
};

let types = await Languages.findAll({ attributes: ["language_code", "language"] });
const availableLetterTypes = types.map((type) => ({
  value: type.language_code,
  label: type.language,
}));

export const LetterTypesResource = {
  resource: LetterTypes,
  options: {
    navigation: menu.LettersType,
    editProperties: ["type","language"],
    listProperties: ["type","language"],
    showProperties: ["type", "language" ],
    filterProperties: ["type", "language" ],
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
    properties: {
      language: {
        availableValues: [
          { value: "", label: "Select a language", placeholder: true },
          ...availableLetterTypes,
        ],
      },
    },
  },
};
