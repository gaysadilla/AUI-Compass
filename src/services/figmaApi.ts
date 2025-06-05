import { FIGMA_PAT } from '../config';

interface FigmaApiResponse {
  status: number;
  data?: any;
  error?: string;
}

class FigmaApiService {
  private baseUrl = 'https://api.figma.com/v1';
  private headers = {
    'X-Figma-Token': FIGMA_PAT,
    'Content-Type': 'application/json',
  };

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<FigmaApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          status: response.status,
          error: data.message || 'An error occurred',
        };
      }

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // Get project files
  async getProjectFiles(projectId: string): Promise<FigmaApiResponse> {
    return this.makeRequest(`/projects/${projectId}/files`);
  }

  // Get file nodes
  async getFileNodes(fileKey: string, ids: string[]): Promise<FigmaApiResponse> {
    return this.makeRequest(`/files/${fileKey}/nodes?ids=${ids.join(',')}`);
  }

  // Get file details with depth
  async getFileDetails(fileKey: string, depth: number = 2): Promise<FigmaApiResponse> {
    return this.makeRequest(`/files/${fileKey}?depth=${depth}`);
  }

  // Get team components
  async getTeamComponents(teamId: string, pageSize: number = 100): Promise<FigmaApiResponse> {
    return this.makeRequest(`/teams/${teamId}/components?page_size=${pageSize}`);
  }

  // Get component sets
  async getComponentSets(teamId: string, pageSize: number = 100): Promise<FigmaApiResponse> {
    return this.makeRequest(`/teams/${teamId}/component_sets?page_size=${pageSize}`);
  }

  // Get component details
  async getComponentDetails(key: string): Promise<FigmaApiResponse> {
    return this.makeRequest(`/components/${key}`);
  }
}

export const figmaApi = new FigmaApiService(); 