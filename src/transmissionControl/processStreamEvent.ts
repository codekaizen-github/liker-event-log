import { Transaction } from 'kysely';
import {
    NewNotYetTotallyOrderedStreamEvent,
    TotallyOrderedStreamEvent,
} from './types';
import { Database } from '../types';
import { createTotallyOrderedStreamEvents } from '../createTotallyOrderedStreamEvents';

export async function processStreamEvent(
    trx: Transaction<Database>,
    event: NewNotYetTotallyOrderedStreamEvent
): Promise<TotallyOrderedStreamEvent[]> {
    return await createTotallyOrderedStreamEvents(trx, event);
}
