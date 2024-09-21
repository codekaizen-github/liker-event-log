// Import the 'express' module
import express from 'express';
import { db } from './database';
import {
    createStreamOutFromStreamEvent,
    findTotallyOrderedStreamEvents,
    getMostRecentStreamOut,
} from './streamOutStore';
import {
    createHttpSubscriber,
    deleteHttpSubscriber,
    findHttpSubscribers,
} from './httpSubscriberStore';
import cors from 'cors';
import onEvent from './transmissionControl/onEvent';
import { notifySubscribers } from './transmissionControl/notifySubscribers';
import { getMostRecentTotallyOrderedStreamEvents } from './getMostRecentTotallyOrderedStreamEvents';

// Create an Express application
const app = express();

// Set the port number for the server
const port = 80;

app.use(
    cors({
        origin: '*',
    })
);
app.use(express.json());

// Define a route for the root path ('/')
app.get('/', (req, res) => {
    // Send a response to the client
    res.send('Hello, TypeScript + Node.js + Express!');
});

app.get('/fencingToken', async (req, res) => {
    await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            const result = await createStreamOutFromStreamEvent(trx, {
                data: { type: 'fencing-token-requested' },
            });
            if (result === undefined) {
                return res.status(500).send();
            }
            return res.json({
                fencingToken: result.id,
            });
        });
});

app.post('/streamIn', async (req, res) => {
    try {
        await onEvent([req.body]);
    } catch (e) {
        console.error(e);
        return res.status(500).send();
    }
    return res.status(201).send();
});

app.get('/streamOut', async (req, res) => {
    // Ignore
    // let totalOrderId = !isNaN(Number(req.query.totalOrderId))
    //     ? Number(req.query.totalOrderId)
    //     : undefined;
    let eventIdStart = !isNaN(Number(req.query.eventIdStart))
        ? Number(req.query.eventIdStart)
        : undefined;
    let eventIdEnd = !isNaN(Number(req.query.eventIdEnd))
        ? Number(req.query.eventIdEnd)
        : undefined;
    let limit = !isNaN(Number(req.query.limit))
        ? Number(req.query.limit)
        : undefined;
    let offset = !isNaN(Number(req.query.offset))
        ? Number(req.query.offset)
        : undefined;
    // Make sure that our replica is up to date
    await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            // Get our upstream
            const mostRecent = await getMostRecentStreamOut(trx);
            const events = await findTotallyOrderedStreamEvents(
                trx,
                eventIdStart,
                eventIdEnd,
                limit,
                offset
            );
            const totalOrderId = mostRecent ? mostRecent.id : 0;
            return res.json({
                totalOrderId,
                events: events.map((event) => {
                    return {
                        ...event,
                        streamId: event.id,
                    };
                }),
            });
        });
    // Find all log records with an ID greater than 'afterId'
    // Send the records to the client
});

app.post('/httpSubscriber/register', async (req, res) => {
    await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            const existing = await findHttpSubscribers(trx, {
                url: req.body.url,
            });
            if (existing.length > 0) {
                return res.status(200).send();
            }
            const result = createHttpSubscriber(trx, req.body);
            return res.status(201).send();
        });
});

app.post('/httpSubscriber/unregister', async (req, res) => {
    await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            const existing = await findHttpSubscribers(trx, {
                url: req.body.url,
            });
            if (existing.length > 0) {
                // delete
                for (const subscription of existing) {
                    await deleteHttpSubscriber(trx, subscription.id);
                }
                return res.status(200).send();
            }
            return res.status(404).send();
        });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    // Log a message when the server is successfully running
    console.log(`Server is running on http://localhost:${port}`);
});

// Get the most recent log record and notify subscribers
(async () => {
    const results = await getMostRecentTotallyOrderedStreamEvents();
    if (results === undefined) {
        return;
    }
    if (results.length === 0) {
        return;
    }
    const totalOrderId = results[results.length - 1].totalOrderId;
    // non-blocking
    notifySubscribers(results, totalOrderId);
})();
