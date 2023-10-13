import importExportFeature from "@adminjs/import-export";
import {
  ActionRequest,
  ActionResponse,
  BaseRecord,
  CurrentAdmin,
} from "adminjs";
import { Components } from "../../frontend/components.js";
import { componentLoader } from "../../frontend/components.ts";
import { Books } from "../db/models/Books.ts";

const bookNavigation = {
  icon: "Book",
};

export const BookResource = {
  resource: Books,
  options: {
    navigation: bookNavigation,
    editProperties: ["name", "publisher_name", "published_year", "url"],
    listProperties: ["name", "publisher_name", "published_year"],
    timestamps: true,
    actions: {
      new: {
        isAccessible: false,
      },
      ViewBook: {
        actionType: "record",
        component: Components.ViewBook,
        icon: "Eye",
        handler: (
          _request: ActionRequest,
          _response: ActionResponse,
          context: {
            record: BaseRecord | undefined;
            currentAdmin: CurrentAdmin;
          }
        ) => {
          const { record, currentAdmin } = context;
          return {
            record: record?.toJSON(currentAdmin),
          };
        },
      },
    },
  },
  features: [
    importExportFeature({
      componentLoader,
    }),
  ],
};
