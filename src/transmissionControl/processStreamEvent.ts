import { Transaction } from 'kysely';
import {
    NewNotYetTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './types';
import { Database } from '../types';
import { createTotallyOrderedStreamEvents } from '../createTotallyOrderedStreamEvents';

export async function processStreamEvent(
    trx: Transaction<Database>,
    newNotYetTotallyOrderedStreamEvent: NewNotYetTotallyOrderedStreamEvent[]
): Promise<TotallyOrderedStreamEvent[]> {
    const results: TotallyOrderedStreamEvent[] = [];
    for (const event of newNotYetTotallyOrderedStreamEvent) {
        if (event.data === undefined) {
            throw new Error('Data is required');
        }
        results.push(...(await createTotallyOrderedStreamEvents(trx, event)));
    }
    return results;
}
