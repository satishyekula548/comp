"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.resend = void 0;
const resend_1 = require("resend");
exports.resend = process.env.RESEND_API_KEY
    ? new resend_1.Resend(process.env.RESEND_API_KEY)
    : null;
const sendEmail = async ({ to, subject, react, marketing, system, test, cc, scheduledAt, }) => {
    if (!exports.resend) {
        throw new Error('Resend not initialized - missing API key');
    }
    // 1) Pull each env var into its own constant
    const fromMarketing = process.env.RESEND_FROM_MARKETING;
    const fromSystem = process.env.RESEND_FROM_SYSTEM;
    const fromDefault = process.env.RESEND_FROM_DEFAULT;
    const toTest = process.env.RESEND_TO_TEST;
    const replyMarketing = process.env.RESEND_REPLY_TO_MARKETING;
    // 2) Decide which one you need for this email
    const fromAddress = marketing
        ? fromMarketing
        : system
            ? fromSystem
            : fromDefault;
    const toAddress = test ? toTest : to;
    const replyTo = marketing ? replyMarketing : undefined;
    // 3) Guard against undefined
    if (!fromAddress) {
        throw new Error('Missing FROM address in environment variables');
    }
    if (!toAddress) {
        throw new Error('Missing TO address in environment variables');
    }
    try {
        const { data, error } = await exports.resend.emails.send({
            from: fromAddress, // now always a string
            to: toAddress, // now always a string
            cc,
            replyTo,
            subject,
            // @ts-ignore – React node allowed by the SDK
            react,
            scheduledAt,
        });
        if (error) {
            console.error('Resend API error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
        return {
            message: 'Email sent successfully',
            id: data?.id,
        };
    }
    catch (error) {
        console.error('Email sending error:', error);
        throw error instanceof Error ? error : new Error('Failed to send email');
    }
};
exports.sendEmail = sendEmail;
