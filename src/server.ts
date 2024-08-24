// Import the 'express' module
import express from 'express';
import { db } from './database';
import {
    createStreamOutFromStreamEvent,
    findStreamOutsGreaterThanStreamOutId,
    getMostRecentStreamOut,
} from './streamOutStore';
import {
    createHttpSubscriber,
    deleteHttpSubscriber,
    findHttpSubscribers,
} from './httpSubscriberStore';
import {
    notifySubscribers,
    processStreamEventInTotalOrder,
} from './subscriptions';

// Create an Express application
const app = express();

// Set the port number for the server
const port = 80;

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
    await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            try {
                await processStreamEventInTotalOrder(trx, req.body);
            } catch (e) {
                console.error(e);
                return res.status(500).send();
            }
            return res.status(201).send();
        });
});

app.get('/streamOut', async (req, res) => {
    // Get the query parameter 'afterId' from the request
    const afterId = Number(req.query.afterId);
    await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            const records = await findStreamOutsGreaterThanStreamOutId(
                trx,
                afterId
            );
            return res.json(records);
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
    await db
        .transaction()
        .setIsolationLevel('serializable')
        .execute(async (trx) => {
            const record = await getMostRecentStreamOut(trx);
            if (record === undefined) {
                return;
            }
            // non-blocking
            notifySubscribers(trx, record);
        });
})();
