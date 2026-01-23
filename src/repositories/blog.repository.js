const { Blog } = require("../models");

class BlogRepository {
    async create(data) {
        return await Blog.create(data);
    }

    async findAll(query = {}) {
        return await Blog.findAll({
            where: query,
            order: [["created_at", "DESC"]],
        });
    }

    async findById(id) {
        return await Blog.findByPk(id);
    }

    async update(id, data) {
        const blog = await this.findById(id);
        if (!blog) return null;
        return await blog.update(data);
    }

    async delete(id) {
        const blog = await this.findById(id);
        if (!blog) return null;
        return await blog.destroy();
    }
}

module.exports = new BlogRepository();
