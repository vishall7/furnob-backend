import Agenda from "agenda";
import { DB_NAME } from "../constant.js";
import { fileUploadToCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";

const agenda = new Agenda({
  db: {
    address: `${process.env.MONGODB_URL}/${DB_NAME}`,
    collection: "background-jobs",
  },
});

agenda.define("upload-images", async (job) => {
  const { mainImage, images, productId } = job.attrs.data;
  if (!mainImage && !images) {
    throw new Error("mainImage and images are required");
  }
  const mainImageUpload = await fileUploadToCloudinary(mainImage);
  const imagesUpload = await Promise.all(
    images?.map((image) => fileUploadToCloudinary(image))
  );
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      mainImage: mainImageUpload?.secure_url,
      images: imagesUpload?.map((image) => image?.secure_url),
    },
    { new: true }
  );
  if (!updatedProduct) {
    console.log("Product images not uploaded");
  }
  return;
});

export const agendaStart = async () => {
  try {
    await agenda.start();
    console.log("Agenda started");
  } catch (error) {
    console.log("Agenda error", error);
    process.exit(1);
  }
};

export default agenda;
