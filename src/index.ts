import express from "express";
import * as session from "express-session";
import "dotenv/config";
import MySQLStore from "express-mysql-session";
import AdminRouter from "./backend/routers/AdminRouters.js";
import { BookResource } from "./backend/resources/BookResource.js";
import { LetterResource } from "./backend/resources/LettersResource.js";
import { componentLoader } from "./frontend/components.js";
import { sequelize } from "./backend/db/config/config.js";
import Users from "./backend/db/models/Users.js";
import NonAdminRouter from "./backend/routers/NonAdminRouters.js";
import { AdminResource } from "./backend/resources/AdminResource.js";
import * as url from "url";
import { LetterTypesResource } from "./backend/resources/LetterTypesResource.js";
import { LanguagesResource } from "./backend/resources/LanguagesResource.js";

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
    const { default: path } = await import("node:path");
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

    AdminJS.registerAdapter({
        Resource: AdminJSSequelize.Resource,
        Database: AdminJSSequelize.Database,
    });

    const admin = new AdminJS({
        branding: {
            companyName: "Type Extract",
            logo: "/images/logo.png",
            withMadeWithLove: false,
        },
        resources: [
            AdminResource,
            LetterResource,
            BookResource,
            LetterTypesResource,
            LanguagesResource,
        ],
        componentLoader,
        dashboard: {
            component: "Dashboard",
        },
        assets: {
            styles: ["/css/cropper.styles.css", "/css/styles.css"],
        },
        env: {
            BASE_URL: process.env.BASE_URL || "",
        },
    });

    const ConnectSession = MySQLStore(session);

    const sessionStore = new ConnectSession({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT
            ? parseInt(process.env.MYSQL_PORT)
            : undefined,
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
    app.use(express.static(path.join(__dirname, "./public")));
    app.use(express.json({ limit: "50mb" }));
    app.use("/admin", NonAdminRouter);
    app.use("/admin", AdminRouter);
    app.use(admin.options.rootPath, adminRouter);

    app.listen(PORT, () => {
        console.log(
            `AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`
        );
    });
};

start();
