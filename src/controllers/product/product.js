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

export const searchProducts = async (req, reply) => {
  try {
    const { branchId, q } = req.query;

    if (!branchId) {
      return reply.status(400).send({ message: "Branch ID is required" });
    }

    if (!q) {
      return reply.send([]);
    }

    const regex = new RegExp(q, "i"); // case-insensitive

    // Fetch with category/subcategory populated
    const products = await Product.find({ branch: branchId })
      .populate({ path: "category", select: "name" })
      .populate({ path: "subCategory", select: "name" })
      .populate({ path: "childCategory", select: "name" });

    // Filter based on name/category/subCategory/childCategory
    const filtered = products.filter((p) => {
      return (
        regex.test(p.name) ||
        regex.test(p.category?.name || "") ||
        regex.test(p.subCategory?.name || "") ||
        regex.test(p.childCategory?.name || "")
      );
    });

    return reply.send(filtered);
  } catch (error) {
    console.log("Search Error:", error);
    return reply.status(500).send({ message: "Failed to search products", error });
  }
};


