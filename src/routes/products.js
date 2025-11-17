//Product routes
import { getAllCategories, getSubcategoriesByCategoryId, getChildrenBySubcategory } from "../controllers/product/category.js";
import { getProductsByCategorySubcategory } from "../controllers/product/product.js";

export const categoryRoutes = async (fastify, options) => {
  fastify.get("/categories", getAllCategories);
  fastify.get("/categories/:categoryId/subcategories", getSubcategoriesByCategoryId);
  fastify.get("/categories/:categoryId/subcategories/:subCategoryId/children", getChildrenBySubcategory);
};

export const productRoutes = async (fastify, options) => {
  fastify.get("/products", getProductsByCategorySubcategory);
  // Get products by category
  fastify.get("/products/:categoryId", getProductsByCategorySubcategory);

  // Get products by category and subcategory
  fastify.get("/products/:categoryId/:subCategoryId", getProductsByCategorySubcategory);

  // Get products by category, subcategory, and child category
  fastify.get("/products/:categoryId/:subCategoryId/:childCategoryId", getProductsByCategorySubcategory);
};
