import { Transaction } from 'kysely';
import {
    NewNotYetTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './types';
import { Database } from '../types';
import { createTotallyOrderedStreamEvent } from '../createTotallyOrderedStreamEvent';

export async function processStreamEvent(
    trx: Transaction<Database>,
    newNotYetTotallyOrderedStreamEvent: NewNotYetTotallyOrderedStreamEvent
): Promise<TotallyOrderedStreamEvent[]> {
    const results: TotallyOrderedStreamEvent[] = [];
    const streamOut = await createTotallyOrderedStreamEvent(
        trx,
        newNotYetTotallyOrderedStreamEvent
    );
    if (streamOut === undefined) {
        throw new Error('Failed to create stream out');
    }
    results.push({
        id: streamOut.id,
        totalOrderId: streamOut.id,
        data: streamOut.data,
    });
    return results;
}
