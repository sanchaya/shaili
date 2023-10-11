import dotenv from "dotenv";

dotenv.config();

const { MYSQL_USER, MYSQL_PASS, MYSQL_DATABASE, MYSQL_HOST } = process.env;

export default {
  development: {
    username: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    dialect: "mysql",
  },
  test: {
    username: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    dialect: "mysql",
  },
  production: {
    username: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    dialect: "mysql",
  },
};
