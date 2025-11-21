import "dotenv/config.js";
import mongoose from "mongoose";
import { Category, Product } from "./src/models/index.js";
import { categories, products } from "./seedData.js";

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log("✔ Old data removed");

    // Insert categories
    const categoryDocs = await Category.insertMany(categories);
    console.log("✔ Categories inserted");

    // Build ID Maps
    const categoryMap = {};
    const subCategoryMap = {};
    const childCategoryMap = {};

    categoryDocs.forEach(cat => {
      categoryMap[cat.name] = cat._id;

      cat.subCategories.forEach(sub => {
        subCategoryMap[sub.name] = sub._id;

        sub.children.forEach(child => {
          childCategoryMap[child.name] = child._id;
        });
      });
    });

    // Convert products
    const productWithIds = products.map(p => ({
      ...p,
      category: categoryMap[p.category],
      subCategory: subCategoryMap[p.subCategory],
      childCategory: childCategoryMap[p.childCategory],
      branch: "67c19b3e7a566c2a0dbeff1e", // REQUIRED
    }));

    await Product.insertMany(productWithIds);
    console.log("✔ Products inserted");

    console.log("🎉 DATABASE SEEDED SUCCESSFULLY");

  } catch (err) {
    console.log("Error Seeding database:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
