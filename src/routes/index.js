import { authRoutes } from "./auth.js";
import { orderRoutes } from "./order.js";
import { categoryRoutes, productRoutes,categoryRoutes2 } from "./products.js";
import { branchRoutes } from "./branch.js";

const prefix = "/api";

export const registerRoutes = async (fastify) => {
  fastify.register(authRoutes, { prefix: prefix });
  fastify.register(productRoutes, { prefix: prefix });
  fastify.register(categoryRoutes, { prefix: prefix });
  fastify.register(categoryRoutes2, { prefix: prefix });
  fastify.register(orderRoutes, { prefix: prefix });
  fastify.register(branchRoutes, { prefix: prefix });
  
  console.log('✅ All routes registered successfully');
  console.log('✅ All routes registered');
  
  // Add this to see all routes after registration
  fastify.after(() => {
    console.log('📍 Available routes:');
    console.log(fastify.printRoutes());
  });
};