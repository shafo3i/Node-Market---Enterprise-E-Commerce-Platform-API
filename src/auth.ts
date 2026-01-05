import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./config/prisma";
import { sendEmail } from "./modules/email/email.service";
import { bearer } from "better-auth/plugins";

// If your Prisma file is located elsewhere, you can change the path



export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: false,
        async sendResetPassword({ user, url }) {
            const frontendUrl = "http://localhost:3000";
            const urlObj = new URL(url);
            urlObj.searchParams.set("callbackURL", frontendUrl + "/auth/password-reset");
            const resetLink = urlObj.toString();
            await sendEmail(user.email, "Reset your password", `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`);
        },
        onPasswordReseted: async ({ user }: { user: any }) => {
            await sendEmail(
                user.email, "Your password has been reset", `<p>Your password has been successfully reset.</p>`
            );
        },
    // maxPasswordLength: 72, // Maximum length for passwords
    // minPasswordLength: 6, // Minimum length for passwords
    // passwordComplexity: {
    //   minLowercase: 0, // Minimum number of lowercase letters
    //   minUppercase: 0, // Minimum number of uppercase letters
    //   minNumbers: 0, // Minimum number of numeric characters
    //   minSymbols: 0, // Minimum number of special characters
    //   // banCommonPasswords: true, // Ban common passwords
    //   // banUsernames: true, // Ban usernames as passwords
    // },
        
        
    },

     emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const frontendUrl = "http://localhost:3000"; // Or process.env.FRONTEND_URL
            const urlObj = new URL(url);
            urlObj.searchParams.set("callbackURL", frontendUrl + "/email-verified");
            const verificationLink = urlObj.toString();
            await sendEmail(user.email, "Verify your email", `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`);
        }
    },

    

    // socialProviders: {
    //     google: {
    //         clientId: process.env.GOOGLE_CLIENT_ID || "",
    //         clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    //         clientKey: "google",
    //         enabled: true,
    //     }
    // },

    user: {
        additionalFields: {
            role: {
                type: "string",
                optional: false,
            }
        }
    },

    plugins: [
        bearer()
    ],

     trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003",
    ],
});