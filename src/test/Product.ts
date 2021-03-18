import { Entity, Scene } from "@rotcare/io";

export class Product extends Entity {
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