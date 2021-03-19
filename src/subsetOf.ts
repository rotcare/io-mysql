import { Scene, Table } from '@rotcare/io';

export function subsetOf<T, C>(table: Table, sql: string, criteriaClass: { new (): C }) {
    return async (scene: Scene, criteria: C) => {
        return [];
    };
}
