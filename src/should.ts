import { newTrace, Scene, ServiceDispatcher } from '@rotcare/io';
import * as mysql from 'mysql2/promise';
import { MysqlDatabase } from './MysqlDatabase';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test',
});

export function should(behavior: string, func: (scene: Scene) => Promise<void>) {
    const database = new MysqlDatabase(pool);
    return async function (this: any) {
        const scene = new Scene(newTrace('test'), {
            tenants: { db: 'default' },
            service: new ServiceDispatcher(database, undefined as any),
        });
        scene.onAtomChanged = (atom) => {
            atom.onAtomChanged(scene.span);
        };
        try {
            return await scene.execute(this, func);
        } finally {
            await pool.end();
        }
    };
}
