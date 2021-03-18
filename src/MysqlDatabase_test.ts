import { Entity, newTrace, Scene } from '@rotcare/io';
import * as mysql from 'mysql2/promise';
import { MysqlDatabase } from './MysqlDatabase';
import { strict } from 'assert';

const pool = mysql.createPool(require('./testConn'));

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
    it('增删改查', async () => {
        class Product extends Entity {
            id: string;
            name: string;
            price: number = 0;
            public static async createProduct(scene: Scene, props: Partial<Product>) {
                return await scene.io.database.insert(scene, Product, props);
            }
            public static async queryProduct(scene: Scene, props: Partial<Product>) {
                return await scene.io.database.query(scene, Product, props);
            }
            public async updatePrice(scene: Scene, newPrice: number) {
                this.price = newPrice;
                await scene.io.database.update(scene, this.table, this);
            }
            public async deleteMe(scene: Scene) {
                await scene.io.database.delete(scene, this.table, this);
            }
        }
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
