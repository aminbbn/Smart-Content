import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { CompanySettings, AgentSettings } from '../../types';

export const handleCompanySettings = async (request: Request, db: DatabaseService) => {
  const method = request.method;

  try {
    if (method === 'GET') {
      // Use cache for settings
      const settings = await db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1', [], true);
      if (settings) {
          try {
              if (settings.product_info && typeof settings.product_info === 'string') {
                  (settings as any).product_info = JSON.parse(settings.product_info);
              } else {
                  (settings as any).product_info = [];
              }
          } catch (e) {
              (settings as any).product_info = [];
          }
          return createResponse(settings);
      }
      return createResponse({
          id: 1,
          name: '',
          industry: '',
          description: '',
          core_values: '',
          tone_of_voice: '',
          target_audience: '',
          product_info: [],
          updated_at: new Date().toISOString()
      });
    }

    if (method === 'POST' || method === 'PUT') {
      const body = await request.json() as any;
      const { name, industry, description, core_values, tone_of_voice, target_audience, product_info } = body;
      
      const productInfoStr = JSON.stringify(product_info || []);

      const exists = await db.queryOne('SELECT id FROM company_settings WHERE id = 1');
      
      if (exists) {
          await db.execute(
              `UPDATE company_settings SET name=?, industry=?, description=?, core_values=?, tone_of_voice=?, target_audience=?, product_info=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`,
              [name, industry, description || '', core_values || '', tone_of_voice, target_audience, productInfoStr]
          );
      } else {
          await db.execute(
              `INSERT INTO company_settings (id, name, industry, description, core_values, tone_of_voice, target_audience, product_info, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [name, industry, description || '', core_values || '', tone_of_voice, target_audience, productInfoStr]
          );
      }
      return createResponse({ success: true }, 'Settings updated');
    }

    return createErrorResponse('Method not allowed', 405);
  } catch (err: any) {
      return createErrorResponse(err.message || 'Settings Error');
  }
};

export const handleAgentSettings = async (request: Request, db: DatabaseService) => {
    const method = request.method;

    try {
        if (method === 'GET') {
            // Use cache
            const settings = await db.queryOne<AgentSettings>('SELECT * FROM agent_settings WHERE id = 1', [], true);
            if (settings) {
                try {
                    (settings as any).model_config = typeof settings.model_config === 'string' ? JSON.parse(settings.model_config) : {};
                    (settings as any).schedule_config = typeof settings.schedule_config === 'string' ? JSON.parse(settings.schedule_config) : {};
                } catch (e) {
                    (settings as any).model_config = {};
                    (settings as any).schedule_config = {};
                }
                return createResponse(settings);
            }
            return createResponse({
                id: 1,
                // Critical Fix: Default to correct model
                model_config: { temperature: 0.7, model_name: 'gemini-3-pro-preview' },
                schedule_config: { research: '0 9 * * *' },
                is_active: 0,
                updated_at: new Date().toISOString()
            });
        }

        if (method === 'POST' || method === 'PUT') {
            const body = await request.json() as any;
            const { model_config, schedule_config, is_active } = body;

            const modelConfigStr = JSON.stringify(model_config || {});
            const scheduleConfigStr = JSON.stringify(schedule_config || {});

            const exists = await db.queryOne('SELECT id FROM agent_settings WHERE id = 1');

            if (exists) {
                await db.execute(
                    `UPDATE agent_settings SET model_config=?, schedule_config=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`,
                    [modelConfigStr, scheduleConfigStr, is_active ? 1 : 0]
                );
            } else {
                await db.execute(
                    `INSERT INTO agent_settings (id, model_config, schedule_config, is_active, updated_at) VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [modelConfigStr, scheduleConfigStr, is_active ? 1 : 0]
                );
            }
            return createResponse({ success: true }, 'Agent settings updated');
        }

        return createErrorResponse('Method not allowed', 405);
    } catch (err: any) {
        return createErrorResponse(err.message || 'Agent Settings Error');
    }
};