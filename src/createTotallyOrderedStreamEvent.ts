import { Transaction } from 'kysely';
import { createStreamOutFromStreamEvent } from './streamOutStore';
import { Database } from './types';
import {
    NewNotYetTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './transmissionControl/types';

export async function createTotallyOrderedStreamEvent(
    trx: Transaction<Database>,
    streamEvent: NewNotYetTotallyOrderedStreamEvent
): Promise<TotallyOrderedStreamEvent> {
    const streamOut = await createStreamOutFromStreamEvent(trx, {
        data: streamEvent.data,
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
