import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./config/prisma";
import { sendEmail } from "./modules/email/email.service";
import { bearer, captcha, lastLoginMethod, twoFactor  } from "better-auth/plugins";
import { SecurityMonitor } from "./lib/security-monitor";

// If your Prisma file is located elsewhere, you can change the path


const securityMonitor = new SecurityMonitor();

export const auth = betterAuth({
    basePath: "/api/auth",
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
    // rateLimit: {
    //     windowMs: 15 * 60 * 1000, // 15 minutes
    //     max: 20, // limit each IP to 20 requests per windowMs
    // },
    

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

    appName: "Node Market", // Used as issuer for 2FA
    
    plugins: [
        bearer(),
        // captcha({
        //     provider: "cloudflare-turnstile",
        //     secretKey: process.env.CF_TURNSTILE_SECRET_KEY!,
        // }),
        lastLoginMethod(),
        twoFactor({
            issuer: "Node Market",
            otpOptions: {
                async sendOTP({ user, otp }, ctx) {
                    await sendEmail(
                        user.email,
                        "Your 2FA Code",
                        `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`
                    );
                },
                period: 300, // 5 minutes
            },
            totpOptions: {
                period: 30,
                digits: 6,
            },
            backupCodeOptions: {
                amount: 10,
                length: 10,
            },
        }),
    ],

     trustedOrigins: [
        // process.env.FRONTEND_URL || "http://localhost:3000",
        // process.env.NBACKEND_URL_HOST || "http://localhost:3003",
        process.env.FRONTEND_URL || "https://i8488wsc0go0k48c4848ssk4.dijango.com",
        process.env.NBACKEND_URL_HOST || "https://ywkocw0408owow804c44ow4g.dijango.com",
    ],
});