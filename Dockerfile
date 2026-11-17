FROM oven/bun:1.3.4

WORKDIR /app

# Install exact locked dependencies, including Prisma CLI for safe schema setup.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application source and generate the Prisma client before building Next.js.
COPY . .
RUN bun run db:generate
RUN bun run build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# The Render persistent disk is mounted at /var/data.
# db:push creates/updates the schema on that persistent SQLite database.
CMD ["sh", "-c", "bun run db:push && bun .next/standalone/server.js"]
