import "dotenv/config";
import fastifySession from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { Admin } from "../models/index.js";

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;

const MongoDBStore = ConnectMongoDBSession(fastifySession)

export const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
})

sessionStore.on('error', (error) => {
    console.log("❌ Session store error:", error)
})

sessionStore.on('connected', () => {
    console.log('✅ Session store connected to MongoDB');
});

export const authenticate = async (email, password) => {
    console.log('🔐 Authentication attempt:', { email, hasPassword: !!password });
    
    try {
        if (email && password) {
            const user = await Admin.findOne({ email });
            console.log('👤 User found:', !!user);
            
            if (!user) {
                console.log('❌ No user found for email:', email);
                return null;
            }
            
            if (user.password === password) {
                console.log('✅ Password match successful for:', email);
                return Promise.resolve({ 
                    email: user.email, 
                    password: user.password,
                    _id: user._id,
                    role: user.role 
                });
            } else {
                console.log('❌ Password mismatch');
                return null;
            }
        }
        
        console.log('❌ Missing email or password');
        return null;
    } catch (error) {
        console.error('🚨 Authentication error:', error);
        return null;
    }
}