import 'dotenv/config';
import { createServer } from '@infrastructure/http/server';

const PORT = process.env.PORT || 3000;

const server = createServer();

// Use httpServer.listen() so Socket.IO is attached to the correct HTTP server
(server as any).httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
