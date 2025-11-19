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
} from "../controllers/product/product.js";

export const categoryRoutes = async (fastify, options) => {
  fastify.get("/categories", getAllCategories);

  fastify.get(
    "/categories/:categoryId/subcategories",
    getSubcategoriesByCategoryId
  );

  fastify.get(
    "/categories/:categoryId/subcategories/:subCategoryId/children",
    getChildrenBySubcategory
  );

  // Get only featured categories
  fastify.get('/categories/featured', getFeaturedCategories);

  // Get sorted categories
  fastify.get('/categories/sorted', getSortedCategories);
  // Query params: ?order=asc|desc

};

export const productRoutes = async (fastify, options) => {
  
  fastify.get("/products/branch/:branch/sponsored", getSponsoredProduct);
  //
  // 1. All products of a branch
  //
  fastify.get("/products/branch/:branch", getProductsByBranch);

  //
  // 2. Products by Category (branch mandatory)
  //
  fastify.get(
    "/products/:categoryId/:branch",
    getProductsByCategorySubcategory
  );

  //
  // 3. Products by Category + SubCategory (branch mandatory)
  //
  fastify.get(
    "/products/:categoryId/:subCategoryId/:branch",
    getProductsByCategorySubcategory
  );

  //
  // 4. Products by Category + SubCategory + ChildCategory (branch mandatory)
  //
  fastify.get(
    "/products/:categoryId/:subCategoryId/:childCategoryId/:branch",
    getProductsByCategorySubcategory
  );

  
  fastify.get("/products/search", searchProducts);

};
