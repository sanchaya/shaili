import importExportFeature from '@adminjs/import-export';
import { Components } from '../../frontend/components.js';
import { componentLoader } from '../../frontend/components.ts'
import { Books } from "../db/models/Books.ts";

const bookNavigation = {
  icon: 'Book',
}

export const BookResource = {
  resource: Books,
  options: {
    navigation: bookNavigation,
    editProperties: ['name', 'publisherName','publishedYear','url'],
    listProperties: ['name', 'publisherName','publishedYear'],
    timestamps: true, 
    actions: {
      new: {
        isAccessible: false, 
      },
      ViewBook: {
        actionType: "record",
        component: Components.ViewBook,
        handler: (
          _request: any,
          _response: any,
          context: { record: any; currentAdmin: any;  }
        ) => {
          const { record, currentAdmin } = context;
          record.url = record.params.url;
          return {
            record: record.toJSON(currentAdmin),
          };
        },
      },
    },
  },
  features: [importExportFeature({
    componentLoader,
  }),
],
}

