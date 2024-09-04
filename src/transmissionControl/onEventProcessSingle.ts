import { db } from '../database';
import { processStreamEvent } from './processStreamEvent';
import { NewNotYetTotallyOrderedStreamEvent } from './types';

export async function onEventProcessSingle(
    event: NewNotYetTotallyOrderedStreamEvent
) {
    const results = await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            return await processStreamEvent(trx, event);
        });
    return results;
}
