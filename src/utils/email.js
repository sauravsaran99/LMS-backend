/**
 * Mock email utility
 * In a real application, this would use nodemailer or a similar service
 */
const sendEmail = async (to, subject, html) => {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    // console.log(`[MOCK EMAIL] Content: ${html}`);
    return Promise.resolve(true);
};

module.exports = {
    sendEmail
};
