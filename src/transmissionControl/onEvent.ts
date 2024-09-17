import { notifySubscribers } from './notifySubscribers';
import { onEventProcessSingle } from './onEventProcessSingle';
import { NewNotYetTotallyOrderedStreamEvent } from './types';

export default async function onEvent(
    event: NewNotYetTotallyOrderedStreamEvent[]
) {
    // Random delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    console.log({ event });
    try {
        const results = await onEventProcessSingle(event);
        if (results.length) {
            notifySubscribers(results);
        }
    } catch (e) {
        console.error(e);
    }
}
