import UserRoles from "../../backend/db/models/UserRoles.ts";
import Users from "../../backend/db/models/Users.ts";
import { menu } from "../../common/menu.ts";
import * as argon2 from "argon2";
import passwordsFeature from "@adminjs/passwords";
import { componentLoader } from "../../frontend/components.ts";
import { ActionContext } from "adminjs";

const isAccessible = (context: ActionContext, role: number) => {
  const { currentAdmin, record, action } = context;
  if (record?.params?.id === currentAdmin?.id && action.name === "edit") {
    return true;
  } else {
    return role === currentAdmin?.role;
  }
};

const hashPassword = async (request: {
  payload: { newPassword: string | Buffer };
}) => {
  if (request.payload?.newPassword) {
    request.payload.newPassword = await argon2.hash(
      request.payload.newPassword
    );
  }
  return request;
};

let roles = await UserRoles.findAll({ attributes: ["id", "role"] });
const availableRoles = roles.map((role) => ({
  value: role.id,
  label: role.role,
}));

export const AdminResource = {
  resource: Users,
  features: [
    passwordsFeature({
      properties: {
        password: "newPassword",
        encryptedPassword: "password",
      },
      hash: argon2.hash,
      componentLoader,
    }),
  ],
  options: {
    navigation: menu.Users,
    listProperties: ["name", "email", "role"],
    properties: {
      password: { isVisible: false },
      role: {
        availableValues: [
          { value: "", label: "Select a role", placeholder: true },
          ...availableRoles,
        ],
      },
    },
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
        before: hashPassword,
      },
      bulkDelete: {
        isAccessible: (context: ActionContext) => isAccessible(context, 1),
      },
    },
  },
};
