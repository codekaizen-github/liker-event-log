import { createStreamOutFromStreamEvent } from './streamOutStore';
import { notifySubscribers } from './subscriptions';
import { Database, StreamEvent } from './types';
import { Transaction } from 'kysely';

export async function processStreamEvent(
    trx: Transaction<Database>,
    newStreamEvent: StreamEvent
) {
    const streamOut = await createStreamOutFromStreamEvent(trx, newStreamEvent);
    if (streamOut === undefined) {
        throw new Error('Failed to create stream out');
    }
    notifySubscribers(trx, streamOut);
}
