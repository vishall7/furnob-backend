import { Resend } from 'resend';

const resend = new Resend('re_CVE5FBWF_6qAeVnbLJnutBbBKL1uSQiTu');

export const sendEmail = async (to, subject, text) => {
    try {
        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to, subject, html: `<p>${text}</p>`
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}