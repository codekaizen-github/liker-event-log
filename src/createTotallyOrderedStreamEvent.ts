import { Transaction } from 'kysely';
import { createStreamOutFromStreamEvent } from './streamOutStore';
import { Database } from './types';
import {
    NewTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './transmissionControl/types';

export async function createTotallyOrderedStreamEvent(
    trx: Transaction<Database>,
    streamEvent: NewTotallyOrderedStreamEvent
): Promise<TotallyOrderedStreamEvent> {
    const streamOut = await createStreamOutFromStreamEvent(trx, {
        ...streamEvent,
        id: undefined,
    });
    if (streamOut === undefined) {
        throw new Error('Failed to create stream out');
    }
    return {
        id: streamOut.id,
        totalOrderId: streamOut.id,
        data: streamOut.data,
    };
}
