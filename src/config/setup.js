// import AdminJS from "adminjs";
// import AdminJSFastify from "@adminjs/fastify";
// import * as AdminJSMongoose from "@adminjs/mongoose";
// import * as Models from "../models/index.js";
// import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
// import { dark, light, noSidebar } from "@adminjs/themes";

// AdminJS.registerAdapter(AdminJSMongoose)

// export const admin = new AdminJS({
//     resources:[
//         {
//             resource: Models.Customer,
//             options: {
//               listProperties: ["phone", "role", "isActivated"],
//               filterProperties: ["phone", "role"],
//             },
//           },
//           {
//             resource: Models.DeliveryPartner,
//             options: {
//               listProperties: ["email", "role", "isActivated"],
//               filterProperties: ["email", "role"],
//             },
//           },
//           {
//             resource: Models.Admin,
//             options: {
//               listProperties: ["email", "role", "isActivated"],
//               filterProperties: ["email", "role"],
//             },
//           },
//         { resource: Models.Branch },
//         { resource: Models.Product },
//         { resource: Models.Category },
//         { resource: Models.Order },
//         { resource: Models.Counter },
//     ],
//     branding: {
//         companyName: "Grocery Delivery App",
//         withMadeWithLove: false,
//     },
//     defaultTheme: light.id,
//     availableThemes: [dark, light, noSidebar],
//     rootPath: '/admin'
// })

// export const buildAdminRouter = async(app) => {
//     // Debug logging for production issues
//     console.log("Environment:", process.env.NODE_ENV);
//     console.log("Cookie password exists:", !!COOKIE_PASSWORD);
    
//     await AdminJSFastify.buildAuthenticatedRouter(
//         admin,
//         {
//             authenticate,
//             cookiePassword: COOKIE_PASSWORD,
//             cookieName: 'adminjs'
//         },
//         app,
//         {
//             store: sessionStore,
//             saveUninitialized: true,
//             secret: COOKIE_PASSWORD,
//             cookie: {
//                httpOnly: true,
//                // Fix for Render deployment - try secure: false first
//                secure: false, // Change this to true once HTTPS is confirmed working
//                sameSite: "lax", // Use "none" if you have CORS issues
//                maxAge: 24 * 60 * 60 * 1000, // 24 hours
//             },
//         }
//     )
// }
import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes";

AdminJS.registerAdapter(AdminJSMongoose)

export const admin = new AdminJS({
    resources:[
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
    defaultTheme: light.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: '/admin'
})

export const buildAdminRouter = async(app) => {
    // Debug logging for production issues
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Cookie password exists:", !!COOKIE_PASSWORD);
    
    await AdminJSFastify.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookiePassword: COOKIE_PASSWORD,
            cookieName: 'adminjs'
        },
        app,
        {
            store: sessionStore,
            saveUninitialized: true,
            secret: COOKIE_PASSWORD,
            cookie: {
               httpOnly: true,
   secure: false,
   sameSite: "lax",
   maxAge: 24 * 60 * 60 * 1000,
   domain: undefined,
            },
        }
    )
}
