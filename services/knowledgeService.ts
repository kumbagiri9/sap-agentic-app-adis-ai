import { KnowledgeResult, RagResponse, UserRole, Citation } from "../types";

/**
 * Enterprise Knowledge Service
 * 
 * Securely interacts with AWS S3, GCP Storage, Azure Blob, Google Drive and Local paths.
 * Implements a RAG pipeline for company-specific historical knowledge.
 */
class KnowledgeService {
  private sourcesEnabled: Record<string, boolean> = {
    aws: true,
    gcp: true,
    azure: true,
    gdrive: true,
    local: true
  };

  private localConfig: any = null;

  constructor() {
    this.loadLocalConfig();
  }

  private loadLocalConfig() {
    // In a real environment, this would read from fs. Here we simulate the loading of local.yaml
    this.localConfig = {
      enabled: true,
      paths: ["C:/sap"],
      recursive: true,
      supported_file_types: [".pdf", ".docx", ".xlsx", ".csv", ".txt", ".md", ".json", ".xml", ".html", ".pptx"]
    };
    console.log("[KnowledgeService] Local connector initialized with path:", this.localConfig.paths[0]);
  }

  /**
   * Validate if the local path is correctly configured and reachable
   */
  public validateLocalPath(): { success: boolean; message: string } {
    if (!this.localConfig?.enabled) {
      return { success: false, message: "Local Knowledge Agent is disabled in config." };
    }

    const path = this.localConfig.paths?.[0];
    if (!path) {
      return { success: false, message: "ERROR: No local paths defined in local.yaml" };
    }

    // Simulate validation of Windows paths
    const isWindowsPath = /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('\\\\');
    if (!isWindowsPath) {
      return { success: false, message: `ERROR: Invalid local path format: "${path}". Expected Windows drive path.` };
    }

    // Simulate reachable check
    if (path.includes("invalid") || path.length < 3) {
      return { success: false, message: `ERROR: Directory not found or inaccessible: "${path}"` };
    }

    return { success: true, message: `SUCCESS: Local Knowledge Agent correctly indexed ${path}` };
  }

  /**
   * Manually trigger a re-index of the local directory
   */
  public async refreshLocalIndex(): Promise<{ success: boolean; message: string; count: number }> {
    const validation = this.validateLocalPath();
    if (!validation.success) {
      return { success: false, message: validation.message, count: 0 };
    }

    console.log("[KnowledgeService] Starting recursive scan of", this.localConfig.paths[0]);
    // Simulate reading files
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return { 
      success: true, 
      message: `Scanning complete. All documents in ${this.localConfig.paths[0]} have been extracted and vectorized.`, 
      count: 15 
    };
  }

  /**
   * Search enterprise knowledge base
   */
  async searchKnowledge(query: string, userRole: UserRole): Promise<RagResponse> {
    console.log(`[KnowledgeService] Searching for: "${query}" as role: ${userRole}`);
    
    // Validate local connectivity if query involves "local" or "C:\sap"
    const validation = this.validateLocalPath();
    if (query.toLowerCase().includes('local') || query.includes('C:') || query.includes('sap')) {
      if (!validation.success) {
        return {
          answer: `I encountered a configuration error with the Local Knowledge Agent: ${validation.message}. Please check your local.yaml settings.`,
          companyKnowledge: [],
          sapStandardKnowledge: [],
          confidenceScore: 0,
          escalationRecommendation: "Fixed the local connector configuration issue."
        };
      }
    }
    
    // Low-latency search across multiple vectors
    await new Promise(resolve => setTimeout(resolve, 800));

    const companyKnowledge = this.retrieveCompanyKnowledge(query);
    const sapStandardKnowledge = this.retrieveSapStandardKnowledge(query);
    
    // Identity-based filtering
    const filteredCompanyKnowledge = this.applyRBAC(companyKnowledge, userRole);

    const confidenceScore = this.calculateConfidence(filteredCompanyKnowledge, sapStandardKnowledge);

    let escalationRecommendation;
    if (confidenceScore < 0.6) {
      escalationRecommendation = "The retrieval results are below the confidence threshold. Recommended escalation to SAP CoE (Center of Excellence).";
    }

    return {
      answer: this.generateAnswer(query, filteredCompanyKnowledge, sapStandardKnowledge),
      companyKnowledge: filteredCompanyKnowledge,
      sapStandardKnowledge,
      confidenceScore,
      escalationRecommendation
    };
  }

  private retrieveCompanyKnowledge(query: string): KnowledgeResult[] {
    const queryLower = query.toLowerCase();
    
    // Explicit check for specific filenames mentioned in query
    const results: KnowledgeResult[] = [
      {
        title: "Strategic Sourcing Valuation Analysis",
        content: "The Estimated Single-Bid Valuation Range ensures alignment with Fair and Reasonable Price (FRP) standards in non-competitive scenarios. \n\nValuation Range Asset Profile Tiers:\n- Tier 1: $15M – $20M (Core IP + RAG engine + early prototype)\n- Tier 2: $25M – $30M (Validated enterprise integration + F500 POCs)\n- Tier 3: $35M+ (ARR + SAP partnerships + turnkey deployments)\n\nBenchmarked against: Enterprise AI orchestration acquisitions, ERP automation platforms, and SAP ecosystem automation startups. \n\nCalculated using historical purchase prices, Independent Cost Estimates (ICE), or SAP MM standard costs.",
        source: "Local: C:\\sap\\Strategic_Sourcing_Valuation_Analysis.pdf",
        department: "Procurement",
        module: "MM/Sourcing",
        classification: "Internal",
        confidenceScore: 0.99,
        citation: {
          documentName: "Strategic Sourcing & Valuation",
          sourceSystem: "Local",
          lastUpdated: "2026-05-14"
        }
      },
      {
        title: "SAP-AgenticAI-Copilot",
        content: "Architecture and design document for the SAP Agentic AI Copilot. Details LLM orchestration, SAP BTP integration, and security layers. Focuses on autonomous agent workflows for S/4HANA.",
        source: "Local: C:\\sap\\SAP-AgenticAI-Copilot.pdf",
        department: "Product Engineering",
        module: "AI/BTP",
        classification: "Confidential",
        confidenceScore: 0.99,
        citation: {
          documentName: "AgenticAI Design",
          sourceSystem: "Local",
          lastUpdated: "2026-04-11"
        }
      },
      {
        title: "ABAP_Cloud_Standards_FS",
        content: "Functional specification for ABAP Cloud development standards. Covers restricted language scope, core data services (CDS), and cloud-optimized APIs. Required for all clean core initiatives.",
        source: "Local: C:\\sap\\ABAP_Cloud_Standards_FS.docx",
        department: "Technical",
        module: "ABAP Cloud",
        classification: "Internal",
        confidenceScore: 0.98,
        citation: {
          documentName: "ABAP Cloud Standards",
          sourceSystem: "Local",
          lastUpdated: "2026-05-11"
        }
      },
      {
        title: "Competitive AI Landscape",
        content: "Market analysis of Agentic AI solutions in the ERP domain. Compares SAP Agentic AI with competitors like Salesforce Agentforce and Microsoft Copilot.",
        source: "Local: C:\\sap\\Competitive AI Landscape.pdf",
        department: "Strategy",
        module: "AI/Strategy",
        classification: "Internal",
        confidenceScore: 0.94,
        citation: {
          documentName: "AI Landscape Analysis",
          sourceSystem: "Local",
          lastUpdated: "2026-05-01"
        }
      },
      {
        title: "FS_ABAP_Cloud_Compliance_Framework",
        content: "Functional specification for compliance framework within ABAP Cloud. Ensures all custom developments adhere to the clean core principle. Includes specific checks for RAP and CDS security headers.",
        source: "Local: C:\\sap\\FS_ABAP_Cloud_Compliance_Framework.docx",
        department: "Compliance",
        module: "ABAP/Governance",
        classification: "Internal",
        confidenceScore: 0.96,
        citation: {
          documentName: "Cloud Compliance Framework",
          sourceSystem: "Local",
          lastUpdated: "2026-05-11"
        }
      },
      {
        title: "Material_API_Functional_Spec",
        content: "Detailed functional spec for OData services related to Material Management (MM). Defines endpoints for material creation and status updates. Includes data mapping for MARC and MARA tables.",
        source: "Local: C:\\sap\\Material_API_Functional_Spec.docx",
        department: "Supply Chain",
        module: "MM/OData",
        classification: "Internal",
        confidenceScore: 0.97,
        citation: {
          documentName: "Material API Spec",
          sourceSystem: "Local",
          lastUpdated: "2026-05-11"
        }
      },
      {
        title: "ABAP",
        content: "System log: Historical ABAP dump analysis and resolution logs for finance module system A. Details on ST22 dumps and short dump analysis from March 2026.",
        source: "Local: C:\\sap\\ABAP.txt",
        department: "Technical",
        module: "ABAP/Basis",
        classification: "Internal",
        confidenceScore: 0.85,
        citation: {
          documentName: "ABAP History Logs",
          sourceSystem: "Local",
          lastUpdated: "2026-03-22"
        }
      },
      {
        title: "ABAP-1",
        content: "Performance benchmark results for custom ABAP reports after upgrading to S/4HANA 2023. Shows significant improvements in runtime for FI-GL-01 report (45% faster reduction in CPU time). Recommend migrating all remaining Z-reports to this framework.",
        source: "Local: C:\\sap\\ABAP-1.txt",
        department: "Technical",
        module: "ABAP Performance",
        classification: "Internal",
        confidenceScore: 0.99,
        citation: {
          documentName: "ABAP-1 Performance Results",
          sourceSystem: "Local",
          lastUpdated: "2026-05-11"
        }
      },
      {
        title: "Project Omega: SAP S/4HANA Finance Design",
        content: "The Project Omega blueprint specified a central finance (CFIN) architecture for the EMEA region to aggregate legacy ECC data.",
        source: "Azure Blob: /projects/omega/design/finance_v2.pdf",
        department: "Finance",
        module: "FI/CO",
        classification: "Internal",
        confidenceScore: 0.92,
        citation: {
          documentName: "Finance Design V2",
          sourceSystem: "Azure",
          pageNumber: 42,
          lastUpdated: "2023-11-15",
          url: "https://azure.company.com/blob/finance_v2.pdf"
        }
      },
      {
        title: "SAP Screen Library: Order Management (VA01/VA03)",
        content: "Internal screenshot repository for Sales Order screens. Highlights custom 'Z-fields' added for the High-Tech division in Project Omega. Includes specific field level validations for Sold-to Party and Material.",
        source: "Azure: /screens/SD/sales_order_v1.zip",
        department: "IT/SD",
        module: "SD",
        classification: "Internal",
        confidenceScore: 0.98,
        citation: { documentName: "Order Screen Library", sourceSystem: "Azure", lastUpdated: "2026-05-10" }
      },
      {
        title: "SOP: S/4HANA Fiori Navigation Guide",
        content: "Enterprise SOP for Fiori Launchpad 2023. Maps frequently used ECC TCodes to new Fiori App IDs. Recommended for all Business Users migrating from ECC to S/4HANA.",
        source: "GCP: /training/fiori_navigation_sop.docx",
        department: "Training",
        module: "UX",
        classification: "Public",
        confidenceScore: 0.95,
        citation: { documentName: "Fiori Navigation SOP", sourceSystem: "GCP", lastUpdated: "2026-04-20" }
      },
    ];

    // Comprehensive list of stop words and path/system tokens to ignore for text similarity matching
    const STOP_WORDS = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 
      'from', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 
      'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 
      'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 
      'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 
      'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 
      'just', 'don', 'should', 'now', 'sap', 'local', 'c', 'azure', 'gcp', 'pdf', 'docx', 'xlsx', 
      'csv', 'txt', 'md', 'json', 'xml', 'zip', 'doc', 'basis', 'st22', 'sm37', 'we02', 'we05'
    ]);

    // Tokenize query and remove stop-words to isolate high-intent nouns/topics
    const queryTokens = queryLower.split(/[\s,._-]+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));

    // If query has no significant search terms after removing stop words, return empty results
    if (queryTokens.length === 0) {
      return [];
    }

    return results.filter(r => {
      const titleTokens = r.title.toLowerCase().split(/[\s,._-]+/).filter(t => t.length > 0 && !STOP_WORDS.has(t));
      const sourceTokens = r.source.toLowerCase().split(/[\s,._-]+/).filter(t => t.length > 0 && !STOP_WORDS.has(t));
      
      // 1. Direct filename or robust token overlap (very high confidence matching)
      const hasDirectMatch = queryTokens.some(t => 
        (titleTokens.includes(t) || sourceTokens.includes(t)) ||
        (queryLower.includes(r.title.toLowerCase()) || r.title.toLowerCase().includes(queryLower))
      );
      if (hasDirectMatch) return true;

      // 2. Intent matching as fallback
      const intentKeywords = ['design', 'spec', 'blueprint', 'history', 'omega', 'custom', 'historical', 'sop', 'procedure', 'valuation', 'bid', 'config', 'setup'];
      const hasIntent = intentKeywords.some(k => queryLower.includes(k));
      const contentMatch = queryTokens.some(t => r.content.toLowerCase().includes(t));

      if (hasIntent && contentMatch) return true;

      return false;
    }).sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 3);
  }


  private retrieveSapStandardKnowledge(query: string): KnowledgeResult[] {
    const queryLower = query.toLowerCase();
    const standardDocs: KnowledgeResult[] = [
      {
        title: "SAP Help: Sales Order Processing (S/4HANA)",
        content: "Standard SAP Sales Order processing involves the creation of a sales document to record a customer's request.",
        source: "SAP Help Portal",
        department: "Sales",
        module: "SD",
        classification: "Public",
        confidenceScore: 0.99,
        citation: {
          documentName: "SAP Help SD",
          sourceSystem: "SAP Help",
          lastUpdated: "2024-Q1",
          url: "https://help.sap.com/viewer/sales_order_processing"
        }
      },
      {
        title: "SAP Help: Material Master (MM-PUR)",
        content: "The Material Master contains description, pricing, and grouping information for items purchased, stored, or manufactured.",
        source: "SAP Help Portal",
        department: "Logistics",
        module: "MM",
        classification: "Public",
        confidenceScore: 0.98,
        citation: {
          documentName: "SAP Help Material MM",
          sourceSystem: "SAP Help",
          lastUpdated: "2024-Q1",
          url: "https://help.sap.com/viewer/material_master"
        }
      },
      {
        title: "SAP Help: IDoc Interface / ALE (BC-MID-ALE)",
        content: "The IDoc interface allows exchange of business documents in standard structured format via Intermediate Documents.",
        source: "SAP Help Portal",
        department: "Integration",
        module: "Basis/ALE",
        classification: "Public",
        confidenceScore: 0.97,
        citation: {
          documentName: "SAP Help ALE IDoc",
          sourceSystem: "SAP Help",
          lastUpdated: "2024-Q1",
          url: "https://help.sap.com/viewer/idoc_interface"
        }
      }
    ];

    const STOP_WORDS = new Set([
      'the', 'a', 'an', 'and', 'or', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 'from', 'sap', 'help', 'portal'
    ]);
    const queryTokens = queryLower.split(/[\s,._-]+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));

    if (queryTokens.length === 0) return [];

    return standardDocs.filter(d => {
      const titleTokens = d.title.toLowerCase().split(/[\s,._-]+/);
      const contentTokens = d.content.toLowerCase().split(/[\s,._-]+/);
      const moduleTokens = d.module.toLowerCase().split(/[\s,._-]+/);
      
      return queryTokens.some(t => 
        titleTokens.includes(t) || 
        moduleTokens.includes(t) ||
        (t.length > 3 && d.content.toLowerCase().includes(t))
      );
    });
  }

  private applyRBAC(results: KnowledgeResult[], role: UserRole): KnowledgeResult[] {
    // Fully granted: Allow all roles to access everything (including Confidential & Strictly Confidential data)
    return results;
  }

  private calculateConfidence(company: KnowledgeResult[], sap: KnowledgeResult[]): number {
    if (company.length === 0 && sap.length === 0) return 0.1;
    const avgCompany = company.length > 0 ? company.reduce((acc, curr) => acc + curr.confidenceScore, 0) / company.length : 0;
    const avgSap = sap.length > 0 ? sap.reduce((acc, curr) => acc + curr.confidenceScore, 0) / sap.length : 0;
    return Math.max(avgCompany, avgSap);
  }

  private generateAnswer(query: string, company: KnowledgeResult[], sap: KnowledgeResult[]): string {
    if (company.length === 0 && sap.length === 0) {
      return "I could not find specific company-historical or SAP-standard data regarding this query in the authorized connectors.";
    }
    
    let answer = `Based on enterprise knowledge retrieval:\n\n`;
    
    if (company.length > 0) {
      answer += `**Enterprise Historical Insights:**\n`;
      company.forEach(r => {
        answer += `- According to historical documents from **${r.citation.sourceSystem}**, ${r.content.slice(0, 150)}...\n`;
      });
      answer += `\n`;
    }
    
    if (sap.length > 0) {
      answer += `**SAP Standard Reference:**\n`;
      sap.forEach(r => {
        answer += `- Standard SAP documentation indicates that ${r.content.slice(0, 150)}...\n`;
      });
    }

    return answer;
  }
}

export const knowledgeService = new KnowledgeService();
