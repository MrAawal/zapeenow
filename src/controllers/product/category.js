//Category Controller
import Category from "../../models/category.js";
import { Customer, DeliveryPartner } from "../../models/user.js";



export const getAllCategories = async (req, reply) => {
  try {
    const { userId } = req.user;
    const customer = await Customer.findById(userId);
    const branch = customer.branch;

    const categories = await Category.find({
      $or: [
        { branches: branch },
        { "subCategories.branches": branch },
        { "subCategories.children.branches": branch }
      ]
    }).sort({ sort: 1 }); // optional sorting

    return reply.send(categories);
  } catch (error) {
    return reply.status(500).send({ message: "Error", error });
  }
};


// e.g. GET /categories/:categoryId/subcategories/:subCategoryId/children


// Get only featured categories
export const getFeaturedCategories = async (req, reply) => {
  try {
    const { userId } = req.user;
    const customer = await Customer.findById(userId);
    const branch = customer.branch;

    const categories = await Category.find({
      isFeatured: true,
      $or: [
        { branches: branch },
        { "subCategories.branches": branch },
        { "subCategories.children.branches": branch }
      ]
    }).sort({ sort: 1 });

    return reply.send(categories);

  } catch (error) {
    return reply.status(500).send({ message: "Error", error });
  }
};


// Get categories sorted by sort field
export const getSortedCategories = async (req, reply) => {
  try {
    const { order } = req.query;
    const sortOrder = order === "desc" ? -1 : 1;

    const { userId } = req.user;
    const customer = await Customer.findById(userId);
    const branch = customer.branch;

    const categories = await Category.find({
      $or: [
        { branches: branch },
        { "subCategories.branches": branch },
        { "subCategories.children.branches": branch }
      ]
    }).sort({ sort: sortOrder });

    return reply.send(categories);

  } catch (error) {
    return reply.status(500).send({ message: "Error", error });
  }
};

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

// e.g. GET /categories/:categoryId/subcategories
// export const getSubcategoriesByCategoryId = async (req, reply) => {
//   const { categoryId } = req.params;

//   try {
//     const { userId } = req.user;
//     const customer = await Customer.findById(userId);
//     const branch = customer.branch;

//     const category = await Category.findOne({
//       _id: categoryId,
//       $or: [
//         { branches: branch },
//         { "subCategories.branches": branch },
//         { "subCategories.children.branches": branch }
//       ]
//     });

//     if (!category) {
//       return reply.status(404).send({ message: "Category not found for this branch" });
//     }

//     // Filter only subcategories matching this branch
//     const filteredSubcategories = category.subCategories.filter(sub =>
//       sub.branches.some(b => b.toString() === branch.toString())
//     );

//     return reply.send(filteredSubcategories);

//   } catch (error) {
//     return reply.status(500).send({ message: "Error", error });
//   }
// };


// export const getChildrenBySubcategory = async (req, reply) => {
//   const { categoryId, subCategoryId } = req.params;

//   try {
//     const { userId } = req.user;
//     const customer = await Customer.findById(userId);
//     const branch = customer.branch;

//     const category = await Category.findOne({
//       _id: categoryId,
//       $or: [
//         { branches: branch },
//         { "subCategories.branches": branch },
//         { "subCategories.children.branches": branch }
//       ]
//     });

//     if (!category) {
//       return reply.status(404).send({ message: "Category not found" });
//     }

//     const subcategory = category.subCategories.id(subCategoryId);
//     if (!subcategory) {
//       return reply.status(404).send({ message: "Subcategory not found" });
//     }

//     // Filter only children that match branch
//     const filteredChildren = subcategory.children.filter(child =>
//       child.branches.some(b => b.toString() === branch.toString())
//     );

//     return reply.send(filteredChildren);

//   } catch (error) {
//     return reply.status(500).send({ message: "Error", error });
//   }
// };







