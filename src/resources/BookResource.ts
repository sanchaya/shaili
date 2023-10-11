import importExportFeature from '@adminjs/import-export';
import { componentLoader, Components } from '../components.js';
import { Books } from "../db/models/Books.js";


export const BookResource = {
  resource: Books,
  options: {
    editProperties: ['name', 'publisherName','publishedYear','url'],
    listProperties: ['name', 'publisherName','publishedYear','url'],
    timestamps: true, 
    actions: {
      new: {
        isAccessible: false, 
      },
    },
  },
  features: [importExportFeature({
    componentLoader,
  }),
],
}