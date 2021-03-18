import { Database, Scene, Table, uuid } from '@rotcare/io';
import * as mysql from 'mysql2/promise';

export class MysqlDatabase implements Database {
    constructor(private readonly pool: mysql.Pool) {}
    private async getConn(scene: Scene) {
        let conn: mysql.PoolConnection = Reflect.get(scene, 'conn');
        if (!conn) {
            Reflect.set(scene, 'conn', (conn = await this.pool.getConnection()));
        }
        return conn;
    }
    public async insert(scene: Scene, table: Table<any>, props: Record<string, any>): Promise<any> {
        if (!props.id) {
            props.id = uuid();
        }
        const columns = Object.keys(props);
        const placeholders = ',?'.repeat(columns.length).substr(1);
        const conn = await this.getConn(scene);
        await conn.execute(
            `INSERT INTO ${table.tableName} (${columns.join(', ')}) VALUES(${placeholders});`,
            columns.map((col) => props[col]),
        );
        return table.create(props);
    }
    public async update(
        scene: Scene,
        table: Table<any>,
        props: Record<string, any>,
    ): Promise<void> {
        const columns = Object.keys(props);
        const conn = await this.getConn(scene);
        await conn.execute(
            `UPDATE ${table.tableName} SET ${columns.map((col) => `${col}=?`).join(', ')}`,
            columns.map((col) => props[col]),
        );
    }
    public async query(
        scene: Scene,
        table: Table<any>,
        props: Record<string, any>,
    ): Promise<any[]> {
        const columns = Object.keys(props);
        let sql = `SELECT * FROM ${table.tableName}`;
        if (columns.length > 0) {
            sql = `${sql} WHERE ${columns.map((col) => `${col}=?`).join(' AND ')}`;
        }
        const conn = await this.getConn(scene);
        const [rows] = await conn.execute(
            sql,
            columns.map((col) => props[col]),
        );
        return (rows as any[]).map((row) => table.create(row));
    }
    public async delete(
        scene: Scene,
        table: Table<any>,
        props: Record<string, any>,
    ): Promise<void> {
        if (!props.id) {
            throw new Error('expect id');
        }
        const conn = await this.getConn(scene);
        await conn.execute(`DELETE FROM ${table.tableName} WHERE id=?`, [props.id]);
    }
    public async onSceneFinished(scene: Scene): Promise<void> {
        let conn: mysql.PoolConnection = Reflect.get(scene, 'conn');
        if (conn) {
            conn.release()
            Reflect.set(scene, 'conn', undefined);
        }
    }
    public async beginTransaction(scene: Scene): Promise<void> {
        const conn = await this.getConn(scene);
        await conn.beginTransaction();
    }
    public async commit(scene: Scene): Promise<void> {
        const conn = await this.getConn(scene);
        await conn.commit();
    }
    public async rollback(scene: Scene): Promise<void> {
        const conn = await this.getConn(scene);
        await conn.rollback();
    }
    public async executeSql(scene: Scene, sql: string, sqlVars: Record<string, any>): Promise<any[]> {
        const conn = await this.getConn(scene);
        return await conn.execute(sql);
    }
}
