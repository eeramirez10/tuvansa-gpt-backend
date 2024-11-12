import { MysqlService } from 'nest-mysql2';

export const executeSqlQueryUseCase = async (
  db: MysqlService,
  query: string,
) => {
  const conn = await db.getConnection();

  const res = await db.query({
    conn,
    sql: query,
  });

  return res;
};
