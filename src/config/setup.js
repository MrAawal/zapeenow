import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js";
import { authenticate, COOKIE_PASSWORD } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes";
import { ComponentLoader } from "adminjs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

AdminJS.registerAdapter(AdminJSMongoose);

const componentLoader = new ComponentLoader();

const SubCategoryDropdown = componentLoader.add(
  'SubCategoryDropdown',
  join(__dirname, 'components', 'SubCategoryDropdown')
);

const ChildCategoryDropdown = componentLoader.add(
  'ChildCategoryDropdown',
  join(__dirname, 'components', 'ChildCategoryDropdown')
);

export const admin = new AdminJS({
  componentLoader,
  rootPath: '/admin',
  branding: {
    companyName: "Grocery Delivery App",
    withMadeWithLove: false,
  },
  defaultTheme: dark.id,
  availableThemes: [dark, light, noSidebar],
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
    { 
      resource: Models.Product,
      options: {
        properties: {
           branch: {
            reference: 'Branch',
            type: 'reference',
          },
          category: {
            reference: 'Category',
            type: 'reference',
          },
          subCategory: {
            type: 'string',
            isVisible: {
              list: true, show: true, filter: true, edit: true
            },
            components: {
              edit: SubCategoryDropdown,
              show: SubCategoryDropdown,
            }
          },
          childCategory: {
            type: 'string',
            isVisible: {
              list: true, show: true, filter: true, edit: true
            },
            components: {
              edit: ChildCategoryDropdown,
              show: ChildCategoryDropdown,
            }
          }
        },
        listProperties: ['name', 'image', 'price', 'category', 'subCategory', 'childCategory'],
      }
    },
    { resource: Models.Category },
    { resource: Models.Order },
    { resource: Models.Counter },
  ],
});

export const buildAdminRouter = async (app) => {
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: COOKIE_PASSWORD,
      cookieName: 'adminjs',
    },
    app
  );
};
