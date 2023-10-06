import { Letters } from '../db/models/Letters.js'
import importExportFeature from "@adminjs/import-export";
import { componentLoader } from '../components.js';
import { LetterType } from '../db/models/LetterType.js';

let types = await LetterType.findAll({ attributes: ["id", "type"] });
const availableRoles = types.map((role) => ({
  value: role.id,
  label: role.type
}));

export const LetterResource = {
  resource: Letters,
  options: {
    editProperties: ['letter', 'letterType'],
    listProperties: ['letter', 'letterType','createdBy',],
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
  features: [importExportFeature({
    componentLoader,
  }),
],

}

