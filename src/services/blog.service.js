const blogRepository = require("../repositories/blog.repository");

class BlogService {
    async createBlog(data) {
        return await blogRepository.create(data);
    }

    async getAllBlogs() {
        return await blogRepository.findAll();
    }

    async getBlogById(id) {
        const blog = await blogRepository.findById(id);
        if (!blog) throw new Error("Blog not found");
        return blog;
    }

    async updateBlog(id, data) {
        const blog = await blogRepository.update(id, data);
        if (!blog) throw new Error("Blog not found");
        return blog;
    }

    async deleteBlog(id) {
        const deleted = await blogRepository.delete(id);
        if (!deleted) throw new Error("Blog not found");
        return deleted;
    }
}

module.exports = new BlogService();
