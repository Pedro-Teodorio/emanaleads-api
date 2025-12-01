import { app } from './app';
import { env } from './config/env';

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server is running on port ${env.PORT}`);
  });
}

// Para Vercel (serverless)
export default app;
