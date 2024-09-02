import { db } from '../database';
import { processStreamEvent } from './processStreamEvent';
import { TotallyOrderedStreamEvent } from './types';

export async function onEventProcessSingle(event: TotallyOrderedStreamEvent) {
    const results = await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            return await processStreamEvent(trx, event);
        });
    return results;
}
