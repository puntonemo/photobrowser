import NodeMailer from 'nodemailer';
import { renderTemplateFromFile } from './renderTemplateFromFile';

export async function sendPinCode(email: string, displayName: string, pinCode: string, language = 'es') {
    const transporter = NodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ?? 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // generated ethereal user
            pass: process.env.SMTP_PASSWORD, // generated ethereal password
        },
    });

    const mailContentData = {
        email,
        displayName,
        pinCode,
        language,
    };

    const mailContent = renderTemplateFromFile('pinCode', mailContentData, language);

    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM, // sender address
        to: `"${displayName ?? email}" ${email}`, // list of receivers
        subject: 'PIN Code', // Subject line // TODO: Translate the subject
        html: mailContent,
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}
