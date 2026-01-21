# 1. Use official Node image
FROM node:18-alpine

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy package files first (for caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy rest of the code
COPY . .

# 6. Expose port (Render/Railway will map it)
EXPOSE 3000

# 7. Start the app
CMD ["npm", "start"]
