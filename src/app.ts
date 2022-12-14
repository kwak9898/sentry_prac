import express, { Express, Request, Response } from 'express';
import Sentry from '@sentry/node';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: 'test',
  name: 'My First Test Transaction',
});

function foo() {
  console.error('error');
}

setTimeout(() => {
  try {
    foo();
  } catch (err) {
    Sentry.captureException(err);
  } finally {
    transaction.finish();
  }
}, 99);

app.listen(port, () => {
  console.log(`🚀Started Server with http://localhost:${port}`);
});
