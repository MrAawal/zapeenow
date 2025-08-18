// server.js or adminSetup.js

import "dotenv/config";
import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";

import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js"; // Adjust path according to your project

AdminJS.registerAdapter(AdminJSMongoose);

const PORT = process.env.PORT || 3000;
const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;

// Setup MongoDB session store
const MongoDBStore = ConnectMongoDBSession(fastifySession);
const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

sessionStore.on("error", (error) => {
  console.error("Session store error:", error);
});

// Authentication function
const authenticate = async (email, password) => {
  if (email && password) {
    const user = await Models.Admin.findOne({ email });
    if (!user) {
      return null;
    }
    // TODO: Replace with hashed password verification for production (e.g. bcrypt)
    if (user.password === password) {
      return Promise.resolve({ email: user.email });
    }
    return null;
  }
  return null;
};

// Initialize AdminJS
const admin = new AdminJS({
  resources: [
    {
      resource: Models.Customer,
      options: {
        listProperties: ["phone", "role", "isActivated"],
        filterProperties: ["phone", "role"],
      },
    },
    {
      resource: Models.DeliveryPartner,
      options: {
        listProperties: ["email", "role", "isActivated"],
        filterProperties: ["email", "role"],
      },
    },
    {
      resource: Models.Admin,
      options: {
        listProperties: ["email", "role", "isActivated"],
        filterProperties: ["email", "role"],
      },
    },
    { resource: Models.Branch },
    { resource: Models.Product },
    { resource: Models.Category },
    { resource: Models.Order },
    { resource: Models.Counter },
  ],
  branding: {
    companyName: "Grocery Delivery App",
    withMadeWithLove: false,
  },
  defaultTheme: "dark",
  availableThemes: ["dark", "light", "noSidebar"],
  rootPath: "/admin",
});

// Setup Fastify server
const fastify = Fastify({
  logger: true,
});

// Register required plugins for cookies and sessions
fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  secret: COOKIE_PASSWORD,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure HTTPS on production
    sameSite: "none", // Necessary for cross-origin cookies when applicable
  },
  store: sessionStore,
  saveUninitialized: false,
});

// Build and register AdminJS authenticated router
const buildAdminRouter = async () => {
  const adminRouter = await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: COOKIE_PASSWORD,
      cookieName: "adminjs",
    },
    fastify,
    {
      store: sessionStore,
      secret: COOKIE_PASSWORD,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      },
      saveUninitialized: false,
    }
  );
  fastify.register(adminRouter, { prefix: admin.options.rootPath });
};

(async () => {
  try {
    await buildAdminRouter();

    fastify.listen(PORT, "0.0.0.0", (err, address) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      fastify.log.info(`AdminJS running at ${address}${admin.options.rootPath}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
})();
