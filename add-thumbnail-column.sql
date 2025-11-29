-- Thêm cột thumbnail vào bảng post
-- Kiểu dữ liệu: TEXT (vì base64 string có thể rất dài, có thể lên đến vài MB)
-- NULL: cho phép NULL vì thumbnail là optional

ALTER TABLE "post" 
ADD COLUMN IF NOT EXISTS "thumbnail" TEXT;

-- Kiểm tra xem cột đã được thêm chưa
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'post' AND column_name = 'thumbnail';

