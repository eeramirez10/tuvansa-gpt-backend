import mysql from 'mysql2/promise';

export const createConnection = async () => {
  const connection = await mysql.createConnection({
    host: process.env.URL_MYSQL,
    user: process.env.USER_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DB_MYSQL,
  });
  return connection;
};
