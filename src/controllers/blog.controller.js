const blogService = require("../services/blog.service");

class BlogController {
    async create(req, res) {
        try {
            const blog = await blogService.createBlog(req.body);
            res.status(201).json({ success: true, data: blog });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const blogs = await blogService.getAllBlogs();
            res.status(200).json({ success: true, data: blogs });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const blog = await blogService.getBlogById(req.params.id);
            res.status(200).json({ success: true, data: blog });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const blog = await blogService.updateBlog(req.params.id, req.body);
            res.status(200).json({ success: true, data: blog });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await blogService.deleteBlog(req.params.id);
            res.status(200).json({ success: true, message: "Blog deleted successfully" });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
}

module.exports = new BlogController();
