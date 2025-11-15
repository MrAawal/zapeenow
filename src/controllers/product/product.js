//Product Controller

import Product from "../../models/products.js";

export const getProductsByCategorySubcategory = async (req, reply) => {
  const { categoryId, subCategoryId, childCategoryId } = req.params;
  try {
    let query = { category: categoryId };
    if (subCategoryId) query.subCategory = subCategoryId;
    if (childCategoryId) query.childCategory = childCategoryId;

    const products = await Product.find(query)
      .select("-category -subCategory -childCategory")
      .exec();

    return reply.send(products);
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};
