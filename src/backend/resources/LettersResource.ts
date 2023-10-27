import { Letters } from "../db/models/Letters.ts";
import importExportFeature from "@adminjs/import-export";
import { componentLoader } from "../../frontend/components.ts";
import { menu } from "../../common/menu.ts";
import { ActionContext } from "adminjs";
import { LetterTypes } from "../db/models/LetterTypes.ts";

const isAccessible = (context: ActionContext, role: number) => {
  const { currentAdmin } = context;
  return role === currentAdmin?.role;
};

let types = await LetterTypes.findAll({ attributes: ["id", "type"] });
const availableLetterTypes = types.map((type) => ({
  value: type.id,
  label: type.type,
}));

export const LetterResource = {
  resource: Letters,
  options: {
    navigation: menu.Letters,
    editProperties: ["letter", "letter_type"],
    listProperties: ["letter", "letter_type", "created_by"],
    timestamps: true,
    actions: {
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
      import: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
      export: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
      bulkDelete: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
    },
    properties: {
      letter_type: {
        availableValues: [
          { value: "", label: "Select a type", placeholder: true },
          ...availableLetterTypes,
        ],
      },
    },
  },
  features: [
    importExportFeature({
      componentLoader,
    }),
  ],
};
