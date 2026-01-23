const contactService = require("../services/contact.service");

class ContactController {
    async create(req, res) {
        try {
            const query = await contactService.createQuery(req.body);
            res.status(201).json({ success: true, data: query, message: "Query submitted successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const queries = await contactService.getAllQueries();
            res.status(200).json({ success: true, data: queries });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ContactController();
