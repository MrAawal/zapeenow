import "dotenv/config";
import { Admin } from "../models/index.js";

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;

export const authenticate = async (email, password) => {
    console.log('🔐 Authentication attempt:', { email, hasPassword: !!password });

    try {
        if (!email || !password) return null;

        const user = await Admin.findOne({ email });
        console.log('👤 User found:', !!user);

        if (!user) return null;

        if (user.password === password) {
            console.log('✅ Password match successful for:', email);
            return {
                email: user.email,
                _id: user._id,
                role: user.role
            };
        }

        console.log('❌ Password mismatch');
        return null;

    } catch (error) {
        console.error('🚨 Authentication error:', error);
        return null;
    }
};
