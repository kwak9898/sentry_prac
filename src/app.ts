import express, { Express, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import dotenv from 'dotenv';
import { RewriteFrames } from '@sentry/integrations';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({
      app,
    }),
    new RewriteFrames({
      root: global.__dirname,
    }),
  ],
});

const transaction = Sentry.startTransaction({
  op: 'test',
  name: 'My First Test Transaction',
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(Sentry.Handlers.errorHandler());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use(function onError(err: Error, req: Request, res: Response) {
  res.statusCode = 500;
  res.end('Test');
});

function exam() {
  throw new Error('에러 발생');
}

setTimeout(() => {
  try {
    exam();
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    transaction.finish();
  }
}, 99);

app.listen(port, () => {
  console.log(`🚀Started Server with http://localhost:${port}`);
});
