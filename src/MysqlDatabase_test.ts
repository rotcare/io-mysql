import * as mysql from 'mysql2/promise';

describe('MysqlDatabase', () => {
    it('增删改查', async () => {
        var connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
        });

        await connection.connect();

        const [result] = await connection.query('SELECT 1 + 1 AS solution');
        console.log((result as any)[0].solution);
        await connection.end();
    });
});
