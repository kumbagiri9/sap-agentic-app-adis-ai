
export interface ConnectorConfig {
  enabled: boolean;
  type: string;
  endpoint?: string;
  catalog?: string;
  warehouse?: string;
  database?: string;
  bucket?: string;
  region?: string;
  transport?: 'http' | 'websocket' | 'stdio' | 'api_gateway' | 'local';
  authType?: 'jwt' | 'mtls' | 'apikey' | 'none' | 'native-rfc' | 'native-hana';
  capabilities?: string[];
}

export class EnterpriseConfigService {
  private static instance: EnterpriseConfigService;
  private configs: Record<string, ConnectorConfig> = {
    salesforce: { enabled: true, type: 'CRM', endpoint: 'https://company.my.salesforce.com' },
    databricks: { enabled: true, type: 'Data Lake', endpoint: 'https://adb-123.azuredatabricks.net', catalog: 'main' },
    snowflake: { enabled: true, type: 'Data Warehouse', warehouse: 'QUERY_WH', database: 'CORP_DATA' },
    aws_s3: { enabled: true, type: 'Storage', bucket: 'enterprise-data-lake', region: 'us-east-1' },
    sap_ecc: { enabled: true, type: 'ERP', endpoint: 'https://ecc-prod.company.com' },
    sap_s8h: { enabled: true, type: 'S/4HANA ERP', endpoint: 'https://mmc-s4sap11.mmc.1stbasis.com:44300' },
    sap_datasphere: { enabled: false, type: 'Analytics' },
    local_agent: { enabled: true, type: 'Local Knowledge', endpoint: 'C:/sap' },
    github_mcp: { 
      enabled: true, 
      type: 'MCP Plugin', 
      endpoint: 'stdio:github_mcp_server.py', 
      transport: 'stdio',
      authType: 'apikey',
      capabilities: ['repo_query', 'issue_tracking', 'pr_review']
    },
    servicenow_mcp: {
      enabled: true,
      type: 'MCP Plugin',
      endpoint: 'https://mcp.servicenow.company.com',
      transport: 'http',
      authType: 'jwt',
      capabilities: ['incident_management', 'cmdb_query']
    },
    openai_agent_mcp: {
      enabled: true,
      type: 'MCP Plugin',
      endpoint: 'https://openai-mcp.company.com',
      transport: 'http',
      authType: 'none',
      capabilities: ['advanced_reasoning', 'coding_assistant']
    },
    sap_ecc_rfc_mcp: {
      enabled: true,
      type: 'MCP Plugin',
      endpoint: 'native-rfc://sap-gui-automation',
      transport: 'local',
      authType: 'native-rfc',
      capabilities: ['rfc_read_table', 'rfc_execute_function']
    },
    // Direct live SAP HANA DB access (SAP_S8H_HANA_HOST), registered as a BTP-style native MCP
    // plugin per user request — real live SQL access via the ABAP Development Tools (ADT) Data
    // Preview/Freestyle SQL REST API (see hanaDbIntelligenceService.ts), never simulated. transport 'local' is the only real/live path
    // this hub supports (matches the sap_ecc_rfc_mcp precedent above).
    sap_hana_btp_mcp: {
      enabled: true,
      type: 'MCP Plugin',
      endpoint: 'native-hana://sap-btp-hana-connectivity',
      transport: 'local',
      authType: 'native-hana',
      capabilities: ['hana_metadata_discovery', 'hana_sql_query']
    }
  };

  public static getInstance(): EnterpriseConfigService {
    if (!EnterpriseConfigService.instance) {
      EnterpriseConfigService.instance = new EnterpriseConfigService();
    }
    return EnterpriseConfigService.instance;
  }

  public getConnector(name: string): ConnectorConfig | undefined {
    return this.configs[name];
  }

  public getAllConnectors(): Record<string, ConnectorConfig> {
    return this.configs;
  }

  public isEnabled(name: string): boolean {
    return this.configs[name]?.enabled || false;
  }
}

export const enterpriseConfig = EnterpriseConfigService.getInstance();
