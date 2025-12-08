import { DatabaseService } from '../../database/db';
import { createResponse } from '../../utils/helpers';

export const handleSeed = async (request: Request, db: DatabaseService) => {
  // Check if writers exist
  const writersCount = await db.queryOne<{count: number}>('SELECT count(*) as count FROM writers');
  
  if (writersCount && writersCount.count > 0) {
    return createResponse({ message: 'Data already seeded' });
  }

  // Seed Company Settings
  const companyInfo = {
    name: 'TechNovation Pars',
    industry: 'Technology & AI',
    tone_of_voice: 'Professional and Innovative',
    target_audience: 'Tech enthusiasts, developers, and business leaders in Iran',
    product_info: JSON.stringify([
        { name: 'AI Content Suite', description: 'Automated content generation tool' },
        { name: 'Cloud API', description: 'High performance API for developers' }
    ])
  };

  await db.execute(
    `INSERT INTO company_settings (id, name, industry, tone_of_voice, target_audience, product_info, updated_at) VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [companyInfo.name, companyInfo.industry, companyInfo.tone_of_voice, companyInfo.target_audience, companyInfo.product_info]
  );

  // Seed Agent Settings
  await db.execute(
    `INSERT INTO agent_settings (id, model_config, schedule_config, is_active, updated_at) VALUES (1, ?, ?, 1, CURRENT_TIMESTAMP)`,
    [JSON.stringify({ model: 'gemini-2.5-flash', temperature: 0.7 }), JSON.stringify({ research: '0 9 * * *' })]
  );

  // Seed Writers
  const writers = [
    {
        name: 'Sara Danish',
        bio: 'Senior tech journalist with a focus on AI.',
        personality: JSON.stringify({ traits: ['Analytical', 'Formal', 'Precise'] }),
        style: JSON.stringify({ sentence_length: 'medium', vocabulary: 'technical' }),
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara'
    },
    {
        name: 'Ali Novin',
        bio: 'Enthusiastic blogger covering startup news.',
        personality: JSON.stringify({ traits: ['Energetic', 'Casual', 'Optimistic'] }),
        style: JSON.stringify({ sentence_length: 'short', vocabulary: 'engaging' }),
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali'
    },
    {
        name: 'Dr. Ramin Farhadi',
        bio: 'Computer science professor and deep tech analyst.',
        personality: JSON.stringify({ traits: ['Academic', 'Deep', 'Thoughtful'] }),
        style: JSON.stringify({ sentence_length: 'long', vocabulary: 'sophisticated' }),
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramin'
    }
  ];

  for (const w of writers) {
      await db.execute(
          `INSERT INTO writers (name, bio, personality, style, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [w.name, w.bio, w.personality, w.style, w.avatar_url]
      );
  }

  return createResponse({ message: 'Seed completed successfully' });
};