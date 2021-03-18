import { Database, Scene, Table, uuid } from '@rotcare/io';
import * as mysql from 'mysql2/promise';

export class MysqlDatabase implements Database {
    constructor(private readonly conn: mysql.Connection) {}
    public async insert(scene: Scene, table: Table<any>, props: Record<string, any>): Promise<any> {
        if (!props.id) {
            props.id = uuid();
        }
        const columns = Object.keys(props);
        const placeholders = ',?'.repeat(columns.length).substr(1);
        await this.conn.execute(
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
        await this.conn.execute(
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
        const [rows] = await this.conn.execute(
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
        debugger;
        await this.conn.execute(`DELETE FROM ${table.tableName} WHERE id=?`, [props.id]);
    }
    executeSql(scene: Scene, sql: string, sqlVars: Record<string, any>): Promise<any[]> {
        throw new Error('Method not implemented.');
    }
}
