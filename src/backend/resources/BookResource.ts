import importExportFeature from '@adminjs/import-export';
import { componentLoader } from '../../frontend/components.ts'
import { Books } from "../db/models/Books.ts";


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