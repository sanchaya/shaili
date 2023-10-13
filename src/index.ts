import express from "express";
import * as session from "express-session";
import "dotenv/config";
import MySQLStore from "express-mysql-session";
import { BookResource } from "./backend/resources/BookResource.ts";
import { LetterResource } from "./backend/resources/LettersResource.ts";
import { componentLoader } from "./frontend/components.ts";
import { sequelize } from "./backend/db/config/config.ts";
import Users from "./backend/db/models/Users.ts";
import NonAdminRouter from "./backend/routers/NonAdminRouters.ts";
import { AdminResource } from "./backend/resources/AdminResource.ts";

const PORT = 8000;

const authenticate = async (email: string, password: string) => {
  const user = await Users.findOne({ where: { email } });
  if (user && (await user.comparePassword(user?.password, password))) {
    return user;
  }
  return null;
};

const start = async () => {
  const app = express();

  try {
    await sequelize.authenticate();
    console.log("Connected Successfully");
  } catch {
    console.log("error");
  }

  const { default: AdminJS } = await import("adminjs");
  const { default: AdminJSExpress } = await import("@adminjs/express");
  const { default: AdminJSSequelize } = await import("@adminjs/sequelize");

  AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  });

  const admin = new AdminJS({
    branding: {
      companyName: "Type Extract",
    },
    resources: [AdminResource, LetterResource, BookResource],
    componentLoader,
    dashboard: {
      component: "Dashboard",
    },
  });

  const ConnectSession = MySQLStore(session);

  const sessionStore = new ConnectSession({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : undefined,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
    createDatabaseTable: true,
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: "sessionsecrte",
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: "sessionsecret",
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "Scaff Admin JS",
    }
  );

  admin.watch();
  app.use(express.json());
  app.use("/admin", NonAdminRouter);
  app.use(admin.options.rootPath, adminRouter);

  app.listen(PORT, () => {
    console.log(
      `AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`
    );
  });
};

start();
