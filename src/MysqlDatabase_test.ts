import { newTrace, Scene } from '@rotcare/io';
import * as mysql from 'mysql2/promise';
import { MysqlDatabase } from './MysqlDatabase';
import { strict } from 'assert';
import { Product } from './testModels/Product';
import { codegen, Model } from '@rotcare/codegen';
import { generateCreateTable } from '@rotcare/io-mysql';

const pool = mysql.createPool({
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "test"
});

const createProductTableSql = codegen((model: Model<Product>) => {
    return `return ${JSON.stringify(generateCreateTable(model))}`;
})

describe('MysqlDatabase', () => {
    let scene: Scene;
    beforeEach(async () => {
        const database = new MysqlDatabase(pool);
        scene = new Scene(newTrace('test'), {
            database,
            serviceProtocol: undefined as any
        });        
        await scene.io.database.executeSql(scene, 'DROP TABLE IF EXISTS Product', {})
        await scene.io.database.executeSql(scene, createProductTableSql, {});
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
