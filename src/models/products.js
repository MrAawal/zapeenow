import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  quantity: { type: String, required: true },
  stock: { type: String, required: true },
  isSponsored:{type:Boolean,required:true},
  isStock:{type:Boolean,required:true},
  
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // no ref since subCategory is nested inside category schema
  },
  childCategory: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    // no ref since childCategory is nested inside subCategory schema
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
