import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect: "mysql",
    port: 3306,
    host: process.env.MYSQL_HOST,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
    logging: false,
});

export { sequelize };
