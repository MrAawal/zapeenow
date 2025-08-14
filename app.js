import 'dotenv/config';
import { connectDB } from './src/config/connect.js';
import fastify from 'fastify';
import { Server } from 'socket.io';
import { registerRoutes } from './src/routes/index.js';
import { admin, buildAdminRouter } from './src/config/setup.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
    const app = fastify();

    try {
        // Connect to MongoDB
        await connectDB(process.env.MONGO_URI);

        // Register routes and admin panel
        await registerRoutes(app);
        await buildAdminRouter(app);

        // Health check route (optional)
        app.get('/health', async (req, reply) => {
            reply.send({ status: 'ok' });
        });

        // Start Fastify server
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`✅ Zapee App running on http://localhost:${PORT}${admin.options.rootPath}`);

        // Attach Socket.IO to Fastify's internal server
        const io = new Server(app.server, {
            cors: { origin: "*" },
            pingInterval: 10000,
            pingTimeout: 5000,
            transports: ['websocket']
        });

        // Socket.IO events
        io.on('connection', (socket) => {
            console.log("A User Connected ✅");

            socket.on("joinRoom", (orderId) => {
                socket.join(orderId);
                console.log(`🔴 User Joined room ${orderId}`);
            });

            socket.on('disconnect', () => {
                console.log("User Disconnected ❌");
            });
        });

    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
};

start();
