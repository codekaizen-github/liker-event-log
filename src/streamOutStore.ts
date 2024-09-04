import { Transaction } from 'kysely';
import {
    StreamOutUpdate,
    StreamOut,
    NewStreamOut,
    Database,
    NewStreamEvent,
    OrderedStreamEvent,
} from './types';
import { TotallyOrderedStreamEvent } from './transmissionControl/types';

export async function findStreamOutById(
    trx: Transaction<Database>,
    id: number
) {
    return await trx
        .selectFrom('streamOut')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst();
}

export async function findStreamOuts(
    trx: Transaction<Database>,
    criteria: Partial<StreamOut>
) {
    let query = trx.selectFrom('streamOut');

    if (criteria.id) {
        query = query.where('id', '=', criteria.id); // Kysely is immutable, you must re-assign!
    }
    return await query.selectAll().execute();
}

export async function findTotallyOrderedStreamEventsGreaterThanStreamId(
    trx: Transaction<Database>,
    id: number
): Promise<TotallyOrderedStreamEvent[]> {
    let query = trx
        .selectFrom('streamOut')
        .where('id', '>', id)
        .orderBy('id', 'asc');
    const queryResults = await query.selectAll().execute();
    return queryResults.map((result) => {
        return {
            ...result,
            totalOrderId: result.id,
        };
    });
}

export async function findStreamOutsGreaterThanStreamId(
    trx: Transaction<Database>,
    id: number
) {
    let query = trx
        .selectFrom('streamOut')
        .where('id', '>', id)
        .orderBy('id', 'asc');
    return await query.selectAll().execute();
}

export async function getMostRecentStreamOut(trx: Transaction<Database>) {
    return await trx
        .selectFrom('streamOut')
        .orderBy('id', 'desc')
        .limit(1)
        .selectAll()
        .executeTakeFirst();
}

export async function updateStreamOut(
    trx: Transaction<Database>,
    id: number,
    updateWith: StreamOutUpdate
) {
    await trx
        .updateTable('streamOut')
        .set(updateWith)
        .where('id', '=', id)
        .execute();
}

export async function createStreamOutFromStreamEvent(
    trx: Transaction<Database>,
    streamEvent: NewStreamEvent | OrderedStreamEvent
) {
    const streamOut = await createStreamOut(trx, {
        ...streamEvent,
        id: undefined,
    });
    if (streamOut === undefined) {
        return undefined;
    }
    return streamOut;
}

export async function createStreamOut(
    trx: Transaction<Database>,
    streamOut: NewStreamOut
) {
    const { insertId } = await trx
        .insertInto('streamOut')
        .values({
            ...streamOut,
            data: JSON.stringify(streamOut.data),
        })
        .executeTakeFirstOrThrow();
    const streamOutResult = await findStreamOutById(trx, Number(insertId));
    if (streamOutResult === undefined) {
        throw new Error('Failed to create stream out');
    }
    return streamOutResult;
}

export async function deleteStreamOut(trx: Transaction<Database>, id: number) {
    const streamOut = await findStreamOutById(trx, id);

    if (streamOut) {
        await trx.deleteFrom('streamOut').where('id', '=', id).execute();
    }

    return streamOut;
}
