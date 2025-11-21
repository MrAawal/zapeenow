// Product Controller
import Product from "../../models/products.js";
import { Customer } from "../../models/user.js";

/* ----------------------------------------------------
   1. FETCH PRODUCTS BY CATEGORY / SUBCATEGORY / CHILD
----------------------------------------------------- */
export const getProductsByCategorySubcategory = async (req, reply) => {
  try {
    const { categoryId, subCategoryId, childCategoryId } = req.params;

    // Get branch from logged-in customer
    const { userId } = req.user;
    const customer = await Customer.findById(userId);
    const branch = customer.branch;

    // Build query
    let query = { category: categoryId, branch };

    if (subCategoryId) query.subCategory = subCategoryId;
    if (childCategoryId) query.childCategory = childCategoryId;

    const products = await Product.find(query)
      .select("-category -subCategory -childCategory -branch");

    return reply.send(products);

  } catch (error) {
    return reply.status(500).send({ message: "Product Fetch Failed", error });
  }
};

export const getProductsByCategoryWithSponsored = async (req, reply) => {
  try {
    const { categoryId } = req.params;
    const { subCategoryId, childCategoryId } = req.query;
    const { type } = req.query;   // true / false / all

    // Get branch from logged-in user
    const { userId } = req.user;
    const customer = await Customer.findById(userId);
    const branch = customer.branch;

    // Base query
    let query = { 
      category: categoryId,
      branch
    };

    if (subCategoryId) query.subCategory = subCategoryId;
    if (childCategoryId) query.childCategory = childCategoryId;

    // Sponsored filter
    if (type === "true") query.isSponsored = true;
    if (type === "false") query.isSponsored = false;
    // if type = "all" → do nothing

    const products = await Product.find(query)
      .select("-category -subCategory -childCategory -branch")
      .sort({ isSponsored: -1, createdAt: -1 }); // sponsored first

    return reply.send(products);

  } catch (error) {
    return reply.status(500).send({ 
      message: "Failed to fetch products", 
      error 
    });
  }
};



/* ----------------------------------------------------
   2. FETCH ALL PRODUCTS FOR USER'S BRANCH
----------------------------------------------------- */
export const getProductsByBranch = async (req, reply) => {
  try {
    const { userId } = req.user;
    const customer = await Customer.findById(userId);
    const branch = customer.branch;

    const products = await Product.find({ branch })
      .select("-category -subCategory -childCategory -branch");

    return reply.send(products);

  } catch (error) {
    return reply.status(500).send({ message: "Failed to fetch branch products", error });
  }
};


/* ----------------------------------------------------
   3. SEARCH PRODUCTS (name + category + sub + child)
----------------------------------------------------- */
export const searchProducts = async (req, reply) => {
  try {
    const { q } = req.query;

    const { userId } = req.user;
    const customer = await Customer.findById(userId);
    const branch = customer.branch;

    if (!q) return reply.send([]);

    const regex = new RegExp(q, "i");

    const products = await Product.find({ branch })
      .populate({ path: "category", select: "name" })
      .populate({ path: "subCategory", select: "name" })
      .populate({ path: "childCategory", select: "name" });

    const filtered = products.filter((p) =>
      regex.test(p.name) ||
      regex.test(p.category?.name || "") ||
      regex.test(p.subCategory?.name || "") ||
      regex.test(p.childCategory?.name || "")
    );

    return reply.send(filtered);

  } catch (error) {
    return reply.status(500).send({ message: "Search failed", error });
  }
};


/* ----------------------------------------------------
   4. SPONSORED PRODUCTS
----------------------------------------------------- */
export const getSponsoredProduct = async (req, reply) => {
  try {
    const { type } = req.query;

    const { userId } = req.user;
    const customer = await Customer.findById(userId);
    const branch = customer.branch;

    const isSponsoredValue = type === "false" ? false : true;

    const products = await Product.find({
      branch,
      isSponsored: isSponsoredValue
    })
      .select("-category -subCategory -childCategory -branch")
      .sort({ createdAt: -1 });

    return reply.send(products);

  } catch (error) {
    return reply.status(500).send({ message: "Failed to fetch sponsored products", error });
  }
};
