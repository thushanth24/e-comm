-- Fix the sequence for the Product table's id column
-- This will set the sequence to the next available ID
SELECT setval('"Product_id_seq"', (SELECT COALESCE(MAX(id), 0) + 1 FROM "Product"), false);

-- Verify the sequence value
SELECT nextval('"Product_id_seq"');
