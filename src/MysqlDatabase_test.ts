import { Entity, Scene } from '@rotcare/io';
import { strict } from 'assert';
import { should } from './should';
import { subsetOf } from './subsetOf';

export class Product extends Entity {
    public id: string;
    public name: string;
    public price: number = 0;

    public static cheapProducts = subsetOf(Product, 'price < 100', class {});

    public static queryProductsByPriceRange = subsetOf(
        Product,
        'price > :lowPrice AND price < :highPrice',
        class {
            highPrice: number;
            lowPrice: number;
        },
    );

    public static async createProduct(scene: Scene, props: Partial<Product>) {
        return await scene.useDatabase().insert(Product, props);
    }
    public static async queryProduct(scene: Scene, props: Partial<Product>) {
        return await scene.useDatabase().query(Product, props);
    }
    public async updatePrice(scene: Scene, newPrice: number) {
        this.price = newPrice;
        await scene.useDatabase().update(this.table, this);
    }
    public async deleteMe(scene: Scene) {
        await scene.useDatabase().delete(this.table, this);
    }
}

async function recreateProductTable(scene: Scene) {
    await scene.useDatabase().executeSql('DROP TABLE IF EXISTS Product', {});
    await scene.useDatabase().executeSql(`CREATE TABLE Product (
        id varchar(255) PRIMARY KEY,
        name varchar(255),
        price int)`, {});
}

describe('MysqlDatabase', () => {
    it(
        '增删改查',
        should('work', async (scene) => {
            await recreateProductTable(scene);
            const apple = await scene.create(Product, { name: 'apple' });
            strict.ok(apple.id);
            await apple.updatePrice(scene, 100);
            strict.equal((await scene.query(Product, { price: 100 })).length, 1);
            await apple.deleteMe(scene);
            strict.equal((await scene.query(Product, {})).length, 0);
        }),
    );
    xit(
        'query cheapsProducts',
        should('return a subset of data', async (scene) => {
            await recreateProductTable(scene);
            await scene.create(Product, { name: 'apple', price: 102 });
            await scene.create(Product, { name: 'pear', price: 99 });
            const cheapProducts = await scene.query(Product.cheapProducts, {});
            strict.equal(1, cheapProducts.length);
        }),
    );
});
