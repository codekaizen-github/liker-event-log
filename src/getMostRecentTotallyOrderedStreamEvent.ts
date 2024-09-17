import { db } from './database';
import { getMostRecentStreamOutsWithSameTotalOrderId } from './streamOutStore';
import { TotallyOrderedStreamEvent } from './transmissionControl/types';

export async function getMostRecentTotallyOrderedStreamEvent(): Promise<
    TotallyOrderedStreamEvent[] | undefined
> {
    return db.transaction().execute(async (trx) => {
        const streamOuts = await getMostRecentStreamOutsWithSameTotalOrderId(
            trx
        );
        return streamOuts.map((streamOut) => {
            return {
                ...streamOut,
                totalOrderId: streamOut.id,
            };
        });
    });
}
