//Product Controller
import Product from "../../models/products.js";

// 1. FETCH PRODUCTS BY CATEGORY / SUBCATEGORY / CHILD CATEGORY + BRANCH
export const getProductsByCategorySubcategory = async (req, reply) => {
  const { categoryId, subCategoryId, childCategoryId, branch } = req.params;

  try {
    if (!branch) {
      return reply.status(400).send({ message: "Branch ID is required" });
    }

    let query = { category: categoryId };

    if (subCategoryId) query.subCategory = subCategoryId;
    if (childCategoryId) query.childCategory = childCategoryId;

    // Mandatory branch
    query.branch = branch;

    const products = await Product.find(query)
      .select("-category -subCategory -childCategory -branch")
      .exec();

    return reply.send(products);
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};


// 2. FETCH ALL PRODUCTS FOR A BRANCH DIRECTLY
export const getProductsByBranch = async (req, reply) => {
  try {
    const { branch } = req.params;

    if (!branch) {
      return reply.status(400).send({ message: "Branch ID is required" });
    }

    const products = await Product.find({ branch })
      .select("-category -subCategory -childCategory -branch");

    return reply.send(products);

  } catch (error) {
    console.log(error);
    return reply.status(500).send({ message: "Failed to fetch branch products", error });
  }
};
