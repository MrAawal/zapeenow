import { authRoutes } from "./auth.js";
import { orderRoutes } from "./order.js";
import { categoryRoutes, productRoutes } from "./products.js";
import { branchRoutes } from "./branch.js";

const prefix = "/api";

export const registerRoutes = async (fastify) => {
  fastify.register(authRoutes, { prefix: prefix });
  fastify.register(productRoutes, { prefix: prefix });
  fastify.register(categoryRoutes, { prefix: prefix });
  fastify.register(orderRoutes, { prefix: prefix });
  fastify.register(branchRoutes, { prefix: prefix });
  
  console.log('✅ All routes registered successfully');
};