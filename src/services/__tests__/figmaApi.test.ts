import { figmaApi } from '../figmaApi';

describe('FigmaApiService', () => {
  // Replace with your actual team ID
  const TEST_TEAM_ID = 'YOUR_TEAM_ID';
  
  it('should fetch team components', async () => {
    const response = await figmaApi.getTeamComponents(TEST_TEAM_ID);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const response = await figmaApi.getTeamComponents('invalid-team-id');
    expect(response.status).not.toBe(200);
    expect(response.error).toBeDefined();
  });
}); 