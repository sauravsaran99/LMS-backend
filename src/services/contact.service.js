const contactRepository = require("../repositories/contact.repository");
const { sendEmail } = require("../utils/email"); // Assuming specific email util exists, otherwise generic placeholder

class ContactService {
    async createQuery(data) {
        const query = await contactRepository.create(data);
        // Optional: Send email notification to admin
        return query;
    }

    async getAllQueries() {
        return await contactRepository.findAll();
    }

    async updateStatus(id, status) {
        return await contactRepository.updateStatus(id, status);
    }
}

module.exports = new ContactService();
