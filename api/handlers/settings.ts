
import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { CompanySettings, AgentSettings, UserSettings } from '../../types';

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
      let body: any = {};
      try {
        body = await request.json();
      } catch (e) {
        return createErrorResponse('Invalid JSON', 400);
      }

      const { name, industry, description, core_values, tone_of_voice, target_audience, product_info } = body;
      
      const exists = await db.queryOne('SELECT id FROM company_settings WHERE id = 1');
      
      if (exists) {
        await db.execute(
            `UPDATE company_settings SET name=?, industry=?, description=?, core_values=?, tone_of_voice=?, target_audience=?, product_info=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`,
            [name, industry, description, core_values, tone_of_voice, target_audience, JSON.stringify(product_info)]
        );
      } else {
        await db.execute(
            `INSERT INTO company_settings (id, name, industry, description, core_values, tone_of_voice, target_audience, product_info, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [name, industry, description, core_values, tone_of_voice, target_audience, JSON.stringify(product_info)]
        );
      }
      return createResponse({ success: true });
    }
    
    return createErrorResponse('Method not allowed', 405);
  } catch (e: any) {
      return createErrorResponse(e.message);
  }
};

export const handleAgentSettings = async (request: Request, db: DatabaseService) => {
  const method = request.method;

  try {
    if (method === 'GET') {
      const settings = await db.queryOne<AgentSettings>('SELECT * FROM agent_settings WHERE id = 1');
      if (settings) {
          try {
              (settings as any).model_config = JSON.parse(settings.model_config);
              (settings as any).schedule_config = JSON.parse(settings.schedule_config);
              // Parse integrations if available, otherwise default to empty object
              (settings as any).integrations = settings.integrations ? JSON.parse(settings.integrations) : {};
          } catch (e) {
              console.error("Failed to parse agent settings JSON", e);
          }
          return createResponse(settings);
      }
      return createResponse({
          model_config: { model_name: 'gemini-3-pro-preview', temperature: 0.7 },
          schedule_config: {},
          integrations: {},
          is_active: 1
      });
    }

    if (method === 'POST') {
      const body: any = await request.json();
      const { model_config, schedule_config, is_active, integrations } = body;

      const exists = await db.queryOne('SELECT id FROM agent_settings WHERE id = 1');
      if (exists) {
          await db.execute(
              `UPDATE agent_settings SET model_config=?, schedule_config=?, integrations=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`,
              [JSON.stringify(model_config), JSON.stringify(schedule_config), JSON.stringify(integrations || {}), is_active ? 1 : 0]
          );
      } else {
          await db.execute(
              `INSERT INTO agent_settings (id, model_config, schedule_config, integrations, is_active, updated_at) VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [JSON.stringify(model_config), JSON.stringify(schedule_config), JSON.stringify(integrations || {}), is_active ? 1 : 0]
          );
      }
      return createResponse({ success: true });
    }
    
    return createErrorResponse('Method not allowed', 405);
  } catch (e: any) {
      return createErrorResponse(e.message);
  }
};

export const handleUserSettings = async (request: Request, db: DatabaseService) => {
    const method = request.method;

    if (method === 'GET') {
        const user = await db.queryOne('SELECT * FROM user_settings WHERE id = 1');
        // Ensure credit_balance defaults to 0 if null
        if (user) {
            (user as any).credit_balance = (user as any).credit_balance || 0;
        }
        return createResponse(user || {});
    }

    if (method === 'POST') {
        const body: any = await request.json();
        
        // Handle API Key Generation
        if (body.action === 'generate_api_key') {
            const newKey = `sk_sc_${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
            
            const exists = await db.queryOne('SELECT id FROM user_settings WHERE id = 1');
            if (exists) {
                await db.execute('UPDATE user_settings SET api_key = ? WHERE id = 1', [newKey]);
            } else {
                await db.execute(
                    `INSERT INTO user_settings (id, first_name, last_name, email, password, api_key, updated_at) VALUES (1, 'Admin', 'User', 'admin@example.com', '', ?, CURRENT_TIMESTAMP)`,
                    [newKey]
                );
            }
            return createResponse({ success: true, api_key: newKey });
        }

        // Handle Add Balance
        if (body.action === 'add_balance') {
            const amount = parseFloat(body.amount);
            if (isNaN(amount) || amount <= 0) return createErrorResponse('Invalid amount', 400);

            const exists = await db.queryOne('SELECT id FROM user_settings WHERE id = 1');
            if (exists) {
                await db.execute('UPDATE user_settings SET credit_balance = COALESCE(credit_balance, 0) + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [amount]);
            } else {
                // Initialize user if not exists (edge case)
                await db.execute(
                    `INSERT INTO user_settings (id, first_name, last_name, email, credit_balance, updated_at) VALUES (1, 'Admin', 'User', 'admin@example.com', ?, CURRENT_TIMESTAMP)`,
                    [amount]
                );
            }
            const updated = await db.queryOne<{credit_balance: number}>('SELECT credit_balance FROM user_settings WHERE id = 1');
            return createResponse({ success: true, new_balance: updated?.credit_balance || amount });
        }

        const { first_name, last_name, email, password, avatar_url } = body;
        
        const exists = await db.queryOne('SELECT id FROM user_settings WHERE id = 1');
        if (exists) {
            await db.execute(
                `UPDATE user_settings SET first_name=?, last_name=?, email=?, password=?, avatar_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`,
                [first_name, last_name, email, password, avatar_url]
            );
        } else {
            await db.execute(
                `INSERT INTO user_settings (id, first_name, last_name, email, password, avatar_url, updated_at) VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [first_name, last_name, email, password, avatar_url]
            );
        }
        return createResponse({ success: true });
    }

    return createErrorResponse('Method not allowed', 405);
};
