const { Pool } = require('pg');

const sourcePool = new Pool({
  user: 'n8n_user',
  password: 'n8n_pass',
  host: '100.68.84.62',
  port: 5432,
  database: '10sat_blog'
});

const targetPool = new Pool({
  user: 'n8n_user',
  password: 'n8n_pass',
  host: '100.68.84.62',
  port: 5432,
  database: 'pendev'
});

async function migrateData() {
  try {
    console.log('🔄 Bắt đầu chuyển dữ liệu từ 10sat_blog sang pendev...\n');

    // Lấy dữ liệu từ bảng post trong 10sat_blog
    console.log('📥 Đang lấy dữ liệu từ bảng post...');
    const result = await sourcePool.query('SELECT * FROM post');
    const posts = result.rows;
    console.log(`✅ Tìm thấy ${posts.length} bài viết\n`);

    if (posts.length === 0) {
      console.log('⚠️  Không có dữ liệu để chuyển!');
      await sourcePool.end();
      await targetPool.end();
      return;
    }

    // Xóa dữ liệu cũ trong bảng post của pendev (nếu có)
    console.log('🗑️  Xóa dữ liệu cũ trong pendev...');
    await targetPool.query('TRUNCATE TABLE post CASCADE');
    console.log('✅ Đã xóa dữ liệu cũ\n');

    // Chèn dữ liệu vào pendev
    console.log('📤 Đang chèn dữ liệu vào pendev...');
    for (const post of posts) {
      await targetPool.query(
        `INSERT INTO post (id, title, slug, excerpt, content, date, "createdAt", "updatedAt", "fontSize", thumbnail, pinned, topic, "relatedArticles")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          post.id,
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          post.date,
          post.createdAt,
          post.updatedAt,
          post.fontSize,
          post.thumbnail,
          post.pinned,
          post.topic,
          post.relatedArticles
        ]
      );
    }
    console.log(`✅ Đã chèn ${posts.length} bài viết\n`);

    // Xác minh dữ liệu
    console.log('🔍 Đang xác minh dữ liệu...');
    const verification = await targetPool.query('SELECT COUNT(*) FROM post');
    const count = verification.rows[0].count;
    console.log(`✅ Pendev hiện có ${count} bài viết\n`);

    console.log('🎉 Chuyển dữ liệu hoàn tất thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi chuyển dữ liệu:', error.message);
    process.exit(1);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

migrateData();
