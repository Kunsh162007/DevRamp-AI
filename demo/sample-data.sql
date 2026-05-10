-- sample-data.sql
-- Run this against your Postgres DB to inject mock data for the demo.

INSERT INTO "User" ("id", "email", "name", "password", "role", "level", "xp", "createdAt", "updatedAt")
VALUES
('user-1', 'demo@devramp.ai', 'Demo User', '$2b$10$xyz', 'USER', 'BEGINNER', 150, NOW(), NOW()),
('admin-1', 'admin@devramp.ai', 'Demo Admin', '$2b$10$xyz', 'ADMIN', 'EXPERT', 5000, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Repository" ("id", "userId", "name", "url", "branch", "createdAt", "updatedAt")
VALUES
('repo-1', 'user-1', 'express-auth-demo', 'https://github.com/example/express-auth', 'main', NOW(), NOW())
ON CONFLICT DO NOTHING;
