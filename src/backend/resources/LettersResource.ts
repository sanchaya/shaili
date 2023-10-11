import { Letters } from "../db/models/Letters.ts";
import importExportFeature from "@adminjs/import-export";
import { componentLoader } from "../../frontend/components.ts";
import { LetterType } from "../db/models/LetterType.ts";
import { menu } from "../../common/menu.ts";

let types = await LetterType.findAll({ attributes: ["id", "type"] });
const availableRoles = types.map((role) => ({
  value: role.id,
  label: role.type,
}));

export const LetterResource = {
  resource: Letters,
  options: {
    navigation: menu.Letters,
    editProperties: ["letter", "letterType"],
    listProperties: ["letter", "letterType", "createdBy"],
    timestamps: true,
    actions: {
      new: {
        isAccessible: false,
      },
    },
    properties: {
      password: { isVisible: false },
      letterType: {
        availableValues: [
          { value: "", label: "Select a role", placeholder: true },
          ...availableRoles,
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
