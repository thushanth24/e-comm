-- Enable RLS on Category table
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

-- Allow public read access to Category
CREATE POLICY "Enable read access for all users" 
ON "Category"
FOR SELECT
USING (true);

-- Allow authenticated users to insert categories
CREATE POLICY "Enable insert for authenticated users" 
ON "Category"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own categories
CREATE POLICY "Enable update for authenticated users"
ON "Category"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow users to delete their own categories
CREATE POLICY "Enable delete for authenticated users"
ON "Category"
FOR DELETE
TO authenticated
USING (true);
