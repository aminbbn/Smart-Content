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
    
    if (!blog) {
        // Mock individual blog if not found
        if (Number(id) < 1000) { // Only mock for reasonable IDs
             return createResponse({
                 id: Number(id),
                 title: "Mock Blog Title",
                 slug: "mock-blog-title",
                 content: "This is a mock blog content used for demonstration purposes. It includes various elements like headers, lists, and paragraphs to visualize the editor.",
                 writer_id: 1,
                 writer_name: "Sara Danish",
                 status: "draft",
                 created_at: new Date().toISOString(),
                 views: 120
             });
        }
        return createErrorResponse('Blog not found', 404);
    }
    
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

    // MOCK DATA INJECTION
    if (blogs.length === 0) {
        const mockBlogs = [
            { id: 1, title: "The Rise of Generative AI", slug: "rise-of-gen-ai", writer_name: "Sara Danish", writer_id: 1, status: "published", created_at: new Date().toISOString(), views: 1540, content: "Content here..." },
            { id: 2, title: "Top 10 Marketing Trends", slug: "marketing-trends", writer_name: "Ali Novin", writer_id: 2, status: "draft", created_at: new Date(Date.now() - 86400000).toISOString(), views: 0, content: "Content here..." },
            { id: 3, title: "Introduction to Quantum Computing", slug: "quantum-computing", writer_name: "Dr. Ramin Farhadi", writer_id: 3, status: "published", created_at: new Date(Date.now() - 172800000).toISOString(), views: 890, content: "Content here..." },
            { id: 4, title: "Web Assembly: The Future?", slug: "web-assembly", writer_name: "Sara Danish", writer_id: 1, status: "scheduled", created_at: new Date(Date.now() - 250000000).toISOString(), views: 0, content: "Content here..." }
        ];
        
        if (status) {
            return createResponse(mockBlogs.filter(b => b.status === status));
        }
        return createResponse(mockBlogs);
    }

    return createResponse(blogs);
  }

  return createErrorResponse('Method not allowed', 405);
};