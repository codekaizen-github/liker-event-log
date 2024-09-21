import { notifySubscribers } from './notifySubscribers';
import { onEventProcess } from './onEventProcess';
import { NewNotYetTotallyOrderedStreamEvent } from './types';

export default async function onEvent(
    event: NewNotYetTotallyOrderedStreamEvent[]
) {
    // Random delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    console.log({ eventAtOnEvent: event });
    try {
        const results = await onEventProcess(event);
        console.log({ results });
        if (results.length) {
            const totalOrderId = results[results.length - 1].totalOrderId;
            notifySubscribers(results, totalOrderId);
        }
    } catch (e) {
        console.error(e);
    }
}
