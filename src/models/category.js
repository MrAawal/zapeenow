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

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  sort:{type:Number,required:true},
  isFeatured:{type:Boolean},  
  subCategories: [subCategorySchema]
});

const Category = mongoose.model("Category", categorySchema);


export default Category;
