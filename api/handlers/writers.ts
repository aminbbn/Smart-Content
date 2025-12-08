import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { Writer } from '../../types';

export const handleWriters = async (request: Request, db: DatabaseService) => {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split('/');
  const id = pathParts.length > 3 ? pathParts[3] : null; 
  const action = pathParts.length > 4 ? pathParts[4] : null;

  // POST /api/writers/:id/set-default
  if (id && action === 'set-default' && method === 'POST') {
      // Transaction-like logic
      await db.execute('UPDATE writers SET is_default = 0'); // Reset all
      await db.execute('UPDATE writers SET is_default = 1 WHERE id = ?', [id]); // Set new
      return createResponse({ success: true }, 'Default writer updated');
  }

  if (id && method === 'GET') {
    const writer = await db.queryOne<Writer>('SELECT * FROM writers WHERE id = ?', [id]);
    if (!writer) return createErrorResponse('Writer not found', 404);
    
    try {
        (writer as any).personality = JSON.parse(writer.personality);
        (writer as any).style = JSON.parse(writer.style);
    } catch(e) {}

    return createResponse(writer);
  }

  if (id && method === 'DELETE') {
    await db.execute('DELETE FROM writers WHERE id = ?', [id]);
    return createResponse({ success: true }, 'Writer deleted');
  }

  if (id && (method === 'PUT' || method === 'PATCH')) {
    const body = await request.json() as any;
    const { name, bio, personality, style, avatar_url } = body;
    
    await db.execute(
        `UPDATE writers SET name=?, bio=?, personality=?, style=?, avatar_url=? WHERE id=?`,
        [name, bio, JSON.stringify(personality), JSON.stringify(style), avatar_url, id]
    );
    return createResponse({ success: true }, 'Writer updated');
  }

  if (method === 'GET') {
    // List all
    const writers = await db.query<Writer>('SELECT * FROM writers ORDER BY is_default DESC, created_at DESC');
    const parsedWriters = writers.map(w => {
        try {
            return {
                ...w,
                personality: JSON.parse(w.personality),
                style: JSON.parse(w.style)
            };
        } catch(e) { return w; }
    });
    return createResponse(parsedWriters);
  }

  if (method === 'POST') {
    const body = await request.json() as any;
    const { name, bio, personality, style, avatar_url } = body;
    
    // Check if it's the first writer, make default
    const count = await db.queryOne<{c: number}>('SELECT count(*) as c FROM writers');
    const isDefault = (count?.c === 0) ? 1 : 0;

    await db.execute(
        `INSERT INTO writers (name, bio, personality, style, avatar_url, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [name, bio, JSON.stringify(personality), JSON.stringify(style), avatar_url, isDefault]
    );
    return createResponse({ success: true }, 'Writer created', 201);
  }

  return createErrorResponse('Method not allowed', 405);
};