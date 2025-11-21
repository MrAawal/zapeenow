// Product Routes
import {
  getAllCategories,
  getSubcategoriesByCategoryId,
  getChildrenBySubcategory,
  getFeaturedCategories,
  getSortedCategories,
} from "../controllers/product/category.js";

import {
  getProductsByCategorySubcategory,
  getProductsByBranch,
  searchProducts,
  getSponsoredProduct,
  getProductsByCategoryWithSponsored,
} from "../controllers/product/product.js";
import { verifyToken } from "../middleware/auth.js";




export const categoryRoutes = async (fastify, options) => {

  fastify.addHook("preHandler", async (request, reply) => {
      const isAuthenticated = await verifyToken(request, reply);
      if (!isAuthenticated) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
    });

  fastify.get("/categories", getAllCategories);

  fastify.get("/categories/featured", getFeaturedCategories);

  fastify.get("/categories/sorted", getSortedCategories);
};
export const categoryRoutes2 = async (fastify, options) => {

  fastify.get("/categories/:categoryId/subcategories", getSubcategoriesByCategoryId);

  fastify.get("/categories/:categoryId/subcategories/:subCategoryId/children", getChildrenBySubcategory);
};



export const productRoutes = async (fastify, options) => {
    fastify.addHook("preHandler", async (request, reply) => {
      const isAuthenticated = await verifyToken(request, reply);
      if (!isAuthenticated) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
    });

  // CATEGORY ONLY
  fastify.get(
    "/products/category/:categoryId",
    getProductsByCategorySubcategory
  );

  // CATEGORY → SUBCATEGORY
  fastify.get(
    "/products/category/:categoryId/subcategory/:subCategoryId",
    getProductsByCategorySubcategory
  );

  // CATEGORY → SUBCATEGORY → CHILD
  fastify.get(
    "/products/category/:categoryId/subcategory/:subCategoryId/child/:childCategoryId",
    getProductsByCategorySubcategory
  );

  fastify.get("/products/sponsored", getSponsoredProduct);
  fastify.get("/products/category/:categoryId/filter", getProductsByCategoryWithSponsored);
  fastify.get("/products/search", searchProducts);

  fastify.get("/products/branch", getProductsByBranch);
};

