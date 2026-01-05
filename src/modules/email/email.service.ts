import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Afrisys Support" <support@afrisys.com>', // sender address
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
};

export const verifySmtpConnection = async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP Server is ready to take our messages");
        return true;
    } catch (error) {
        console.error("❌ SMTP Connection Error:", error);
        return false;
    }
};
