//Category Controller
import Category from "../../models/category.js";

export const getAllCategories = async (req, reply) => {
  try {
    const categories = await Category.find();
    return reply.send(categories);
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

// e.g. GET /categories/:categoryId/subcategories
export const getSubcategoriesByCategoryId = async (req, reply) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (category) {
      return reply.send(category.subCategories);
    }
    return reply.status(404).send({ message: "Category not found" });
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};


// e.g. GET /categories/:categoryId/subcategories/:subCategoryId/children
export const getChildrenBySubcategory = async (req, reply) => {
  const { categoryId, subCategoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (category) {
      const subcategory = category.subCategories.id(subCategoryId);
      if (subcategory) {
        return reply.send(subcategory.children);
      }
      return reply.status(404).send({ message: "Subcategory not found" });
    }
    return reply.status(404).send({ message: "Category not found" });
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

