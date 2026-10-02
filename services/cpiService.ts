export interface CpiInterfaceDetail {
  interfaceId: string;
  interfaceName: string;
  packageId: string;
  adapterType: 'OData v4' | 'IDoc_AAE' | 'SFTP' | 'REST / SOAP' | 'AMQP Event Mesh';
  sourceSystem: string;
  targetSystem: string;
  status: 'ACTIVE' | 'WARNING' | 'FAILED' | 'RETRYING';
  messagesProcessed24h: number;
  failedCount24h: number;
  averageLatencyMs: number;
  lastExecutionTime: string;
  aiAgentInterfaceSummary: string;
}

export interface CpiMessageFailureDetail {
  messageGuid: string;
  iFlowId: string;
  interfaceName: string;
  senderSystem: string;
  receiverSystem: string;
  errorCategory: 'HTTP_503_SERVICE_UNAVAILABLE' | 'XSLT_MAPPING_EXCEPTION' | 'IDOC_SYNTAX_ERROR' | 'OAUTH_TOKEN_EXPIRED' | 'CERTIFICATE_EXPIRED';
  errorMessage: string;
  payloadSnippet: string;
  timestamp: string;
  retryAttempts: number;
  maxRetriesAllowed: number;
  status: 'FAILED_NEED_ACTION' | 'AUTO_RETRIED' | 'SUCCESS_REPROCESSED';
  aiRootCauseAnalysis: string;
  aiRecommendedFix: string;
}

export interface CpiRetryExecutionResult {
  messageGuid: string;
  iFlowId: string;
  retryStatus: 'RETRY_SUCCESS' | 'RETRY_QUEUED' | 'PERMANENT_FAILURE';
  executionTimeMs: number;
  responseCode: number;
  aiRetryLog: string;
}

export interface CpiMappingInspectorDetail {
  mappingId: string;
  mappingType: 'Message Mapping (Graphical)' | 'XSLT Mapping' | 'Groovy Script Transformation';
  sourceSchema: string;
  targetSchema: string;
  validationStatus: 'VALID' | 'SYNTAX_WARNING' | 'MISSING_FIELD_MAPPING';
  fieldsMappedCount: number;
  customFunctionsCount: number;
  sampleSourcePayload: string;
  sampleTransformedPayload: string;
  aiMappingOptimizationInsight: string;
}

export interface CpiApiCatalogDetail {
  apiName: string;
  apiProxyUrl: string;
  targetBackendService: string;
  authPolicy: 'OAuth 2.0 Mutual TLS' | 'API Key Header' | 'Basic Auth';
  rateLimitPerMinute: number;
  activeCallsToday: number;
  status: 'HEALTHY' | 'THROTTLED' | 'DOWN';
  aiApiPolicyAssessment: string;
}

export class CpiService {
  private static interfaces: CpiInterfaceDetail[] = [
    {
      interfaceId: 'INT_CPI_001_S4_ARIBA_PO',
      interfaceName: 'S/4HANA to SAP Ariba PO Real-Time Integration',
      packageId: 'PKG_PROCUREMENT_S4_ARIBA',
      adapterType: 'OData v4',
      sourceSystem: 'SAP S/4HANA Cloud (S4P)',
      targetSystem: 'SAP Ariba Procurement Network',
      status: 'ACTIVE',
      messagesProcessed24h: 18450,
      failedCount24h: 3,
      averageLatencyMs: 280,
      lastExecutionTime: '2026-08-01 20:25 CET',
      aiAgentInterfaceSummary: 'Agentic CPI Monitoring: Interface health 99.98%. All 3 temporary HTTP 503 gateway timeouts automatically retried and recovered.'
    },
    {
      interfaceId: 'INT_CPI_002_IDOC_ORDERS05_EWM',
      interfaceName: 'Outbound Sales Order IDoc (ORDERS05) to EWM Warehouse',
      packageId: 'PKG_LOGISTICS_EWM_SYNC',
      adapterType: 'IDoc_AAE',
      sourceSystem: 'SAP ERP Client 100',
      targetSystem: 'SAP EWM Warehouse Management',
      status: 'WARNING',
      messagesProcessed24h: 9210,
      failedCount24h: 12,
      averageLatencyMs: 410,
      lastExecutionTime: '2026-08-01 20:28 CET',
      aiAgentInterfaceSummary: 'Agentic CPI Monitoring: Warning detected on IDoc segment E1EDP01 mapping. 12 messages pending automated reprocessing.'
    }
  ];

  private static failures: CpiMessageFailureDetail[] = [
    {
      messageGuid: 'MSG-CPI-889102-S4-ARIBA',
      iFlowId: 'IFLOW_S4_TO_ARIBA_PO_SYNC',
      interfaceName: 'S/4HANA to SAP Ariba PO Real-Time Integration',
      senderSystem: 'SAP S/4HANA Cloud (S4P)',
      receiverSystem: 'SAP Ariba Procurement Network',
      errorCategory: 'OAUTH_TOKEN_EXPIRED',
      errorMessage: 'HTTP 401 Unauthorized: Bearer Token for SAP Ariba OAuth 2.0 client expired during outbound payload posting.',
      payloadSnippet: '{"PurchaseOrder": "4500089201", "Supplier": "10002938", "TotalAmountEuros": 145000.00}',
      timestamp: '2026-08-01 20:12 CET',
      retryAttempts: 2,
      maxRetriesAllowed: 5,
      status: 'FAILED_NEED_ACTION',
      aiRootCauseAnalysis: 'Root-Cause Analysis: The OAuth 2.0 access token stored in CPI Security Material "ARIBA_OAUTH_CRED" expired. Auto-token refresh grant requested.',
      aiRecommendedFix: 'Automated Agent Fix: Execute automated OAuth 2.0 token refresh call against Ariba OAuth server and execute immediate reprocessing retry.'
    }
  ];

  private static mappings: CpiMappingInspectorDetail[] = [
    {
      mappingId: 'MAP_S4_PO_TO_ARIBA_CXML',
      mappingType: 'Message Mapping (Graphical)',
      sourceSchema: 'PurchaseOrder_OData_v4.xsd',
      targetSchema: 'cXML_OrderRequest_v1.2.xsd',
      validationStatus: 'VALID',
      fieldsMappedCount: 84,
      customFunctionsCount: 3,
      sampleSourcePayload: '<PurchaseOrder><ID>4500089201</ID><Supplier>10002938</Supplier></PurchaseOrder>',
      sampleTransformedPayload: '<cXML><Request><OrderRequest><OrderHeader orderID="4500089201"/></OrderRequest></Request></cXML>',
      aiMappingOptimizationInsight: 'Agentic CPI Mapping Inspector: Structural mapping 100% valid. Groovy Script pre-transformation optimized for zero heap memory overhead.'
    }
  ];

  private static apiCatalog: CpiApiCatalogDetail[] = [
    {
      apiName: 'SAP S/4HANA Business Partner OData API',
      apiProxyUrl: 'https://api-gate.btp.int.sap.com/v1/s4/business-partner',
      targetBackendService: 'SAP S/4HANA Cloud API_BUSINESS_PARTNER',
      authPolicy: 'OAuth 2.0 Mutual TLS',
      rateLimitPerMinute: 1200,
      activeCallsToday: 48920,
      status: 'HEALTHY',
      aiApiPolicyAssessment: 'Agentic API Management Assessment: API Proxy active with rate limiting enabled. Mutual TLS security certificate valid until Dec 2027.'
    }
  ];

  public static async getInterfaces(interfaceId?: string): Promise<CpiInterfaceDetail[]> {
    if (interfaceId) {
      return this.interfaces.filter(i => i.interfaceId.toLowerCase().includes(interfaceId.toLowerCase()) || i.interfaceName.toLowerCase().includes(interfaceId.toLowerCase()));
    }
    return this.interfaces;
  }

  public static async getFailures(messageGuid?: string): Promise<CpiMessageFailureDetail[]> {
    if (messageGuid) {
      return this.failures.filter(f => f.messageGuid.toLowerCase().includes(messageGuid.toLowerCase()));
    }
    return this.failures;
  }

  public static async retryFailedIntegration(messageGuid: string): Promise<CpiRetryExecutionResult> {
    const found = this.failures.find(f => f.messageGuid.toLowerCase().includes(messageGuid.toLowerCase()));
    if (found) {
      found.status = 'SUCCESS_REPROCESSED';
      found.retryAttempts += 1;
    }
    return {
      messageGuid: messageGuid,
      iFlowId: found ? found.iFlowId : 'IFLOW_CPI_RETRY_GENERIC',
      retryStatus: 'RETRY_SUCCESS',
      executionTimeMs: 185,
      responseCode: 200,
      aiRetryLog: `Agentic Integration Suite Automated Execution: Failed message ${messageGuid} successfully reprocessed after OAuth token renewal. Target endpoint acknowledged HTTP 200 OK.`
    };
  }

  public static async getMappingInspector(mappingId?: string): Promise<CpiMappingInspectorDetail> {
    if (mappingId) {
      const found = this.mappings.find(m => m.mappingId.toLowerCase().includes(mappingId.toLowerCase()));
      if (found) return found;
    }
    return this.mappings[0];
  }

  public static async getApiCatalog(apiName?: string): Promise<CpiApiCatalogDetail[]> {
    if (apiName) {
      return this.apiCatalog.filter(a => a.apiName.toLowerCase().includes(apiName.toLowerCase()));
    }
    return this.apiCatalog;
  }
}
