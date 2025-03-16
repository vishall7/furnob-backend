import Agenda from "agenda";
import { DB_NAME } from "../constant.js";
import { fileUploadToCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";
import { sendEmail } from "../utils/resend.js";
import { User } from "../models/user.model.js";

const agenda = new Agenda({
  db: {
    address: `${process.env.MONGODB_URL}/${DB_NAME}`,
    collection: "background-jobs",
  },
});

agenda.define("upload-images", async (job) => {
  try {
    const { images, productId } = job.attrs.data;
    if (!images) {
      throw new Error("images are required");
    }
    const imagesUpload = await Promise.all(
      images?.map((image) => fileUploadToCloudinary(image))
    );
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        images: imagesUpload?.map((image) => image?.secure_url),
      },
      { new: true }
    );
    if (!updatedProduct) {
      throw new Error("product images not uploaded");
    }    
  } catch (error) {
    console.log(error);
    job.fail(error);
  }
});

agenda.define("send-otp", async (job) => {
  try {
    const { email, otp } = job.attrs.data;
    const { error } = await sendEmail(
      email,
      "otp verification",
      `your otp is ${otp}`
    );
    if (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.log(error);
    job.fail(error);
  }
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
