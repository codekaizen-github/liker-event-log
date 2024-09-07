import { Transaction } from 'kysely';
import {
    NewNotYetTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './types';
import { Database } from '../types';
import { createTotallyOrderedStreamEvents } from '../createTotallyOrderedStreamEvents';

export async function processStreamEvent(
    trx: Transaction<Database>,
    newNotYetTotallyOrderedStreamEvent: NewNotYetTotallyOrderedStreamEvent
): Promise<TotallyOrderedStreamEvent[]> {
    const results = await createTotallyOrderedStreamEvents(
        trx,
        newNotYetTotallyOrderedStreamEvent
    );
    return results;
}
