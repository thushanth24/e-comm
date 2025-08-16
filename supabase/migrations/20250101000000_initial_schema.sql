-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS "ProductImage" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;

-- Create Category table
CREATE TABLE "Category" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "parentId" INTEGER REFERENCES "Category"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Product table
CREATE TABLE "Product" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "price" DECIMAL(10, 2) NOT NULL,
    "description" TEXT NOT NULL,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false
);

-- Create ProductImage table
CREATE TABLE "ProductImage" (
    "id" SERIAL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "productId" INTEGER NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_slug_idx" ON "Product"("slug");
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- Create a trigger to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to the Category table
CREATE TRIGGER update_category_modtime
BEFORE UPDATE ON "Category"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
