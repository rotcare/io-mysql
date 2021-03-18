import { newTrace, Scene } from '@rotcare/io';
import * as mysql from 'mysql2/promise';
import { MysqlDatabase } from './MysqlDatabase';
import { strict } from 'assert';
import { Product } from './test/Product';
import { codegen, Model } from '@rotcare/codegen';

const pool = mysql.createPool({
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "test"
});

// export const abc = codegen((model: Model<Product>) => {
//     return '"hello"';
// })

describe('MysqlDatabase', () => {
    let scene: Scene;
    beforeEach(async () => {
        const database = new MysqlDatabase(pool);
        scene = new Scene(newTrace('test'), {
            database,
            serviceProtocol: undefined as any
        });        
        await scene.io.database.executeSql(scene, 'DROP TABLE IF EXISTS Product', {})
        await scene.io.database.executeSql(scene, `CREATE TABLE Product (
            id varchar(255) PRIMARY KEY,
            name varchar(255),
            price int)`, {});
    })
    after(async() => {
        await pool.end()
    })
    it('增删改查', async () => {
        await scene.execute(undefined, async() => {
            const apple = await scene.create(Product, { name: 'apple' });
            strict.ok(apple.id);
            await apple.updatePrice(scene, 100);
            strict.equal((await scene.query(Product, { price: 100 })).length, 1);
            await apple.deleteMe(scene);
            strict.equal((await scene.query(Product, {})).length, 0);
        })
    });
});
