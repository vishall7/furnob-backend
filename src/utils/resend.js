import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",  
  port: 465,
  secure: true,
  auth: {
    user: "furnobfurnitures@gmail.com",
    pass: "lhjxlkhhbfcmrzwg",
  },
});

export const sendEmail = async ({ to, subject, text }) => {
  try {
    const info = await transporter.sendMail({
      from: {
        name: "Furnob Furnitures",
        address: "furnobfurnitures@gmail.com",
      },
      to,
      subject,
      text,
    })
    return info;
  } catch (error) {
    console.log(error);
  }
};
