import { createStreamOutFromStreamEvent } from '../streamOutStore';
// import { notifySubscribers } from "./subscriptions";
import { Transaction } from 'kysely';
import {
    NewTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './types';
import { Database } from '../types';

export async function processStreamEvent(
    trx: Transaction<Database>,
    newTotallyOrderedStreamEvent: NewTotallyOrderedStreamEvent
) {
    const results: TotallyOrderedStreamEvent[] = [];
    const streamOut = await createStreamOutFromStreamEvent(
        trx,
        newTotallyOrderedStreamEvent
    );
    if (streamOut === undefined) {
        throw new Error('Failed to create stream out');
    }
    results.push({
        id: streamOut.id,
        totalOrderId: newTotallyOrderedStreamEvent.totalOrderId,
        data: streamOut.data,
    });
    return results;
}
