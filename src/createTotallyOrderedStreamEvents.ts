import { Transaction } from 'kysely';
import { createStreamOutFromStreamEvent } from './streamOutStore';
import { Database } from './types';
import {
    NewNotYetTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './transmissionControl/types';
import {
    getStreamOutIncrementorForUpdate,
    insertIntoIgnoreStreamOutIncrementor,
    updateStreamOutIncrementor,
} from './streamOutIncrementorStore';

export async function createTotallyOrderedStreamEvents(
    trx: Transaction<Database>,
    streamEvent: NewNotYetTotallyOrderedStreamEvent
): Promise<TotallyOrderedStreamEvent[]> {
    const results: TotallyOrderedStreamEvent[] = [];
    const incrementorForUpdateLock = await getStreamOutIncrementorForUpdate(
        trx,
        0
    ); // Prevents duplicate entry keys and insertions in other tables
    const incrementorControlIgnore = await insertIntoIgnoreStreamOutIncrementor(
        trx,
        {
            id: 0,
            streamId: 0,
        }
    );
    const incrementorControl = await getStreamOutIncrementorForUpdate(trx, 0);
    if (incrementorControl === undefined) {
        throw new Error('Failed to get incrementor control lock');
    }
    const incrementorControlToUpdate = {
        id: 0,
        streamId: ++incrementorControl.streamId,
    };
    const streamOut = await createStreamOutFromStreamEvent(trx, {
        totalOrderId: incrementorControl.streamId,
        streamId: incrementorControl.streamId,
        data: streamEvent.data,
    });
    if (streamOut === undefined) {
        throw new Error('Failed to create stream out');
    }
    results.push(streamOut);
    await updateStreamOutIncrementor(trx, 0, incrementorControlToUpdate);
    return results;
}
