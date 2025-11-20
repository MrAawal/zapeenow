//Category Schema
import mongoose from "mongoose";
const subCategoryChildrenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
}, { _id: true }); // Enable ObjectId for each child

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  children: [subCategoryChildrenSchema],
}, { _id: true }); // Enable ObjectId for each subcategory


/* -------------------------------------------
   Main Category Schema (with branches)
--------------------------------------------- */
const categorySchema = new mongoose.Schema(
  {
    branches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true,
      }
    ],

    name: { type: String, required: true },
    image: { type: String, required: true },

    sort: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false },

    subCategories: [subCategorySchema],
  },
  { timestamps: true }
);

/* -------------------------------------------
   Indexes
--------------------------------------------- */

// category level
categorySchema.index({ branches: 1 });
categorySchema.index({ sort: 1 });
categorySchema.index({ isFeatured: 1, branches: 1 });

// subcategory level
categorySchema.index({ "subCategories.branches": 1 });

// children level
categorySchema.index({ "subCategories.children.branches": 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
