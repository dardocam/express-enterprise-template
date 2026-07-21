import request from 'supertest';
import { createApp } from '../../../app';

describe('Health Module (e2e)', () => {
  const app = createApp();

  it('GET /api/health should return 200 and UP status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('UP');
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('timestamp');
  });
});
