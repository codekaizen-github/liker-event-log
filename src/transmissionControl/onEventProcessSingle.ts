import { db } from '../database';
import { processStreamEvent } from './processStreamEvent';
import {
    NewNotYetTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './types';

export async function onEventProcessSingle(
    events: NewNotYetTotallyOrderedStreamEvent[]
) {
    const results: TotallyOrderedStreamEvent[] = [];
    await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            const eachResults: TotallyOrderedStreamEvent[] = [];
            for (const event of events) {
                if (event.data === undefined) {
                    throw new Error('Data is required');
                }
                eachResults.push(...(await processStreamEvent(trx, event)));
            }
            results.push(...eachResults);
        });
    return results;
}
