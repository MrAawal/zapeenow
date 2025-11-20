import {
  adminGetAllCategories,
  adminGetSubcategories,
  adminGetChildCategories
} from "../controllers/product/category.admin.js";

export const adminCategoryRoutes = async (fastify) => {
  fastify.get("/admin/categories", adminGetAllCategories);

  fastify.get(
    "/admin/categories/:categoryId/subcategories",
    adminGetSubcategories
  );

  fastify.get(
    "/admin/categories/:categoryId/subcategories/:subCategoryId/children",
    adminGetChildCategories
  );
};
