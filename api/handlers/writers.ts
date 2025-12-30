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
      await db.execute('UPDATE writers SET is_default = 0'); 
      await db.execute('UPDATE writers SET is_default = 1 WHERE id = ?', [id]); 
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
    
    // MOCK DATA INJECTION
    if (writers.length === 0) {
        const mockWriters = [
            {
                id: 1,
                name: 'Sara Danish',
                bio: 'Senior tech journalist with a focus on AI. Loves deep analysis and structured arguments.',
                personality: { traits: ['Analytical', 'Formal', 'Precise'] },
                style: { sentence_length: 'medium', vocabulary: 'technical' },
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Ali Novin',
                bio: 'Enthusiastic blogger covering startup news. Uses emojis and energetic language.',
                personality: { traits: ['Energetic', 'Casual', 'Optimistic'] },
                style: { sentence_length: 'short', vocabulary: 'engaging' },
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali',
                is_default: 0,
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Dr. Ramin Farhadi',
                bio: 'Computer science professor and deep tech analyst. Very detailed and authoritative.',
                personality: { traits: ['Academic', 'Deep', 'Thoughtful'] },
                style: { sentence_length: 'long', vocabulary: 'sophisticated' },
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramin',
                is_default: 0,
                created_at: new Date().toISOString()
            }
        ];
        return createResponse(mockWriters);
    }

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