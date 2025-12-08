import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse, createSlug } from '../../utils/helpers';
import { Blog } from '../../types';

export const handleBlogs = async (request: Request, db: DatabaseService) => {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split('/');
  // /api/blogs/:id or /api/blogs/:id/publish
  const id = pathParts.length > 3 ? pathParts[3] : null; 
  const action = pathParts.length > 4 ? pathParts[4] : null;

  if (id && action === 'publish' && method === 'POST') {
     await db.execute(
         `UPDATE blogs SET status='published', published_at=CURRENT_TIMESTAMP WHERE id=?`,
         [id]
     );
     return createResponse({ success: true }, 'Blog published');
  }

  if (id && method === 'GET') {
    const blog = await db.queryOne<Blog>(`
        SELECT b.*, w.name as writer_name 
        FROM blogs b 
        LEFT JOIN writers w ON b.writer_id = w.id 
        WHERE b.id = ?
    `, [id]);
    
    if (!blog) return createErrorResponse('Blog not found', 404);
    
    // Increment view
    await db.execute('UPDATE blogs SET views = views + 1 WHERE id = ?', [id]);
    
    return createResponse(blog);
  }

  if (id && method === 'DELETE') {
    await db.execute('DELETE FROM blogs WHERE id = ?', [id]);
    return createResponse({ success: true }, 'Blog deleted');
  }

  if (method === 'GET') {
    const status = url.searchParams.get('status');
    const query = status 
        ? `SELECT b.*, w.name as writer_name FROM blogs b LEFT JOIN writers w ON b.writer_id = w.id WHERE b.status = ? ORDER BY b.created_at DESC`
        : `SELECT b.*, w.name as writer_name FROM blogs b LEFT JOIN writers w ON b.writer_id = w.id ORDER BY b.created_at DESC`;
    
    const params = status ? [status] : [];
    const blogs = await db.query<Blog>(query, params);
    return createResponse(blogs);
  }

  return createErrorResponse('Method not allowed', 405);
};
