import { Database, Scene, Table } from '@rotcare/io';

export class MysqlDatabase implements Database {
    insert(scene: Scene, table: Table<any>, props: Record<string, any>): Promise<any> {
        throw new Error('Method not implemented.');
    }
    query(scene: Scene, table: Table<any>, props: Record<string, any>): Promise<any[]> {
        throw new Error('Method not implemented.');
    }
    update(scene: Scene, table: Table<any>, props: Record<string, any>): Promise<void> {
        throw new Error('Method not implemented.');
    }
    delete(scene: Scene, table: Table<any>, props: Record<string, any>): Promise<void> {
        throw new Error('Method not implemented.');
    }
    executeSql(scene: Scene, sql: string, sqlVars: Record<string, any>): Promise<any[]> {
        throw new Error('Method not implemented.');
    }
}