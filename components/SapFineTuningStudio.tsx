import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cpu, 
  Shuffle, 
  ShieldCheck, 
  Trash2, 
  RefreshCcw, 
  Send, 
  Check, 
  AlertTriangle, 
  Save, 
  Plus, 
  ArrowRight, 
  Layers, 
  Download, 
  Eye, 
  History, 
  Lock, 
  ThumbsUp, 
  ThumbsDown,
  LineChart, 
  BarChart, 
  HeartHandshake,
  Workflow
} from 'lucide-react';

interface TrainingDoc {
  id: string;
  name: string;
  module: string;
  content: string;
  size: string;
  status: 'Unprocessed' | 'Scanned & Masked' | 'Q&A Generated';
  maskedCount: number;
}

interface QaPair {
  id: string;
  instruction: string;
  response: string;
  verified: boolean;
  module: string;
}

interface RetrainingItem {
  id: string;
  query: string;
  originalAnswer: string;
  expertCorrection: string;
  sourceModule: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const SapFineTuningStudio: React.FC<{ userRole: string }> = ({ userRole }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'pipeline' | 'lora' | 'router' | 'memory' | 'evaluation' | 'learning'>('pipeline');

  // --- 1. Pipeline State ---
  const [docs, setDocs] = useState<TrainingDoc[]>([
    { id: '1', name: 'SOP_SD_VA01_OrderCreation_v2.1.txt', module: 'SD', size: '24 KB', status: 'Q&A Generated', maskedCount: 14, content: 'Standard operating procedure for VA01 Sales Order creation. Customer account numbers like ID-998249 and credit limits of $50,000 are verified by MM-Group. Server IP: 172.16.89.4.' },
    { id: '2', name: 'ABAP_Cloud_Standards_MV45AFZZ.docx', module: 'ABAP', size: '142 KB', status: 'Scanned & Masked', maskedCount: 8, content: 'ABAP Custom User-Exit standards for MV45AFZZ program. Ensure memory references to workareas like WA_MARC are protected. Developer contact: ssmith@company.com.' },
    { id: '3', name: 'S4HANA_Finance_CentralSproTaxes.pdf', module: 'FI/CO', size: '512 KB', status: 'Unprocessed', maskedCount: 0, content: 'SPRO configuration details for Country Tax Groupings T005I and GL account structures. Secure financial database links are configured under destination MMC_SSL_GATEWAY.' }
  ]);
  const [uploadName, setUploadName] = useState('');
  const [uploadModule, setUploadModule] = useState('SD');
  const [uploadContent, setUploadContent] = useState('');
  const [isMasking, setIsMasking] = useState(false);
  const [maskingLogs, setMaskingLogs] = useState<string[]>([]);
  const [qaPairs, setQaPairs] = useState<QaPair[]>([
    { id: 'q1', instruction: 'How do you create a Sales Order under high credit limits in the S/4 SD module?', response: 'Use transaction VA01. Enter the SOLD-TO party ID, select standard order type OR. The credit limit holds can be bypassed via authorized PFCG check pointer routines if [REDACTED_FINANCIAL_INFO] limits correspond to verified bank guarantees.', verified: true, module: 'SD' },
    { id: 'q2', instruction: 'What user exits should be optimized for dynamic pricing validations in sales order items?', response: 'Optimize MV45AFZZ program inside USEREXIT_PRICING_PREPARE_TKOMP. Verify length of custom conditions and enforce standard structured validations before field value transfer.', verified: true, module: 'ABAP' }
  ]);

  // --- 2. Training Job/LoRA State ---
  const [loraRank, setLoraRank] = useState('16');
  const [loraAlpha, setLoraAlpha] = useState('32');
  const [learningRate, setLearningRate] = useState('2e-4');
  const [epochs, setEpochs] = useState('3');
  const [tuningMode, setTuningMode] = useState<'lora' | 'qlora'>('qlora');
  const [targetModules, setTargetModules] = useState('q_proj, v_proj');
  const [baseModel, setBaseModel] = useState('gemini-3.5-flash-adapted');
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainLoss, setTrainLoss] = useState(1.42);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [activeAdapters, setActiveAdapters] = useState<Record<string, boolean>>({
    'sap-sd-lora': true,
    'sap-fico-lora': true,
    'sap-abap-lora': true,
    'sap-basis-lora': false,
    'sap-idoc-lora': true
  });

  // --- 3. Adapter Router State ---
  const [testQuery, setTestQuery] = useState('');
  const [routingResult, setRoutingResult] = useState<any | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // --- 4. Memory State ---
  const [hasLongTermConsent, setHasLongTermConsent] = useState(true);
  const [shortTermPref, setShortTermPref] = useState('Standard Help Preference');
  const [guestSession, setGuestSession] = useState<{
    module: string;
    system: string;
    recentQueries: string[];
    discussedTcode: string;
  }>({
    module: 'SD (Sales & Distribution)',
    system: 'S8H S/4HANA 100 Client',
    recentQueries: ['VA01 creating sequence', 'Credit limit checking SPRO rules'],
    discussedTcode: 'VA01 / VA03'
  });
  const [longTermProfile, setLongTermProfile] = useState<{
    frequentModule: string;
    favTcodes: string[];
    roles: string[];
    typicalContext: string;
    isolationKey: string;
  }>({
    frequentModule: 'SD / Basis / ABAP',
    favTcodes: ['VA01', 'ME21N', 'BD87', 'BP'],
    roles: ['Functional Consultant', 'Basis Auditor'],
    typicalContext: 'MMC EMEA Division - Plant PL-FRA-02',
    isolationKey: 'TENANT-S8H-C100-ACTIVE'
  });

  // --- 5. Continuous Learning State ---
  const [learningQueue, setLearningQueue] = useState<RetrainingItem[]>([
    { id: 'l1', query: 'ST22 ABAP DUMP DYNPRO_FIELD_CONVERSION in alternate price tables', originalAnswer: 'Check general screen dimensions or contact administrator.', expertCorrection: 'This error is triggered when RV45A-KWMENG field overflow occurs inside USEREXIT_PRICING_PREPARE_TKOMP inside MV45AFZZ program. Ensure safety checks check if alternate price field (ZPRICE_ALT) fits standard 15 character limit.', sourceModule: 'ABAP', status: 'Pending' },
    { id: 'l2', query: 'How to bypass standard VAT checks for tax indicator mismatch in ME21N?', originalAnswer: 'Modify country schema.', expertCorrection: 'Do not modify T005I standard schema. Ensure MARC configuration indicator matches SPRO VK11 reference, otherwise override transaction defaults via active FI user exit SAPLFIFO_US4.', sourceModule: 'FI/CO', status: 'Pending' }
  ]);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

  // --- Handles Training Documents Upload ---
  const handleDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName || !uploadContent) return;
    const newDoc: TrainingDoc = {
      id: String(docs.length + 1),
      name: uploadName,
      module: uploadModule,
      content: uploadContent,
      size: `${Math.ceil(uploadContent.length / 1024)} KB`,
      status: 'Unprocessed',
      maskedCount: 0
    };
    setDocs([...docs, newDoc]);
    setUploadName('');
    setUploadContent('');
  };

  // --- PII Masking Governance Mechanism ---
  const runDataMaskingAndCleaning = (docId: string) => {
    setDocs(prev => prev.map(d => {
      if (d.id !== docId) return d;
      let newTxt = d.content;
      let count = 0;
      
      // Mask IP Addresses
      const ipReg = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
      if (ipReg.test(newTxt)) {
        newTxt = newTxt.replace(ipReg, '[REDACTED_IP_ADDR]');
        count += 2;
      }
      
      // Mask Emails
      const mailReg = /[\w.-]+@[\w.-]+\.\w+/g;
      if (mailReg.test(newTxt)) {
        newTxt = newTxt.replace(mailReg, '[REDACTED_EMPLOYEE_EMAIL]');
        count += 1;
      }
      
      // Mask standard currency/accounts
      const financialReg = /(\$\d{1,3}(,\d{3})*(\.\d{2})?|\bID-\d{5,8}\b)/g;
      if (financialReg.test(newTxt)) {
        newTxt = newTxt.replace(financialReg, '[REDACTED_FINANCIAL_INFO]');
        count += 3;
      }

      setMaskingLogs(logs => [
        ...logs,
        `[Governance] Document ${d.name} successfully filtered. Masked ${count} high-risk elements. Content transitioned to Approved Clean state.`
      ]);

      return {
        ...d,
        content: newTxt,
        status: 'Scanned & Masked',
        maskedCount: d.maskedCount + count
      };
    }));
  };

  // --- Auto Instruction-Answer Generation ---
  const generateQaDataset = (docId: string) => {
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;

    const newQa1: QaPair = {
      id: `q-dynamic-${Date.now()}-1`,
      instruction: `Define SPRO configuration tables mentioned in document ${doc.name}.`,
      response: `The document references active configurations of standard SAP database layouts including standard structures inside S/4HANA. All referenced variables conform to limpio core requirements.`,
      verified: false,
      module: doc.module
    };

    const newQa2: QaPair = {
      id: `q-dynamic-${Date.now()}-2`,
      instruction: `How are business flows handled after sanitizing ${doc.name}?`,
      response: `Business flows conform to clean core standards. Custom rules (including [REDACTED_IP_ADDR] mappings) are executed over the certified OData standard gateway.`,
      verified: false,
      module: doc.module
    };

    setQaPairs([...qaPairs, newQa1, newQa2]);
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, status: 'Q&A Generated' } : d));
    
    setMaskingLogs(logs => [
      ...logs,
      `[PEFT Pipeline] Converted cleaned content from ${doc.name} to SFT (Supervised Fine Tuning) model format. Generated 2 verified Q&A pairs.`
    ]);
  };

  // --- Simulation of Fine-Tuning Training Loop ---
  const triggerFineTuningJob = () => {
    setIsTraining(true);
    setTrainProgress(0);
    setTrainLoss(1.6);
    setTrainingLogs([
      '[Job Start] Initializing GCP Vertex AI TPU/GPU Adapter Cluster...',
      '[PEFT Engine] Reading SFT instruction datasets...',
      `[Config] Method: PEFT QLoRA 4-bit, Rank: ${loraRank}, Alpha: ${loraAlpha}, Learning Rate: ${learningRate}`,
      `[Lineage] Dataset compiled from 12 document matrices. Initialized masking checking...`
    ]);

    const interval = setInterval(() => {
      setTrainProgress(prev => {
        const next = prev + 10;
        setTrainLoss(l => Math.max(0.08, l - 0.15 + (Math.random() * 0.05)));
        
        // Dynamic logs matching training steps
        if (next === 20) {
          setTrainingLogs(logs => [...logs, '[Step] Epoch 1/3: Shuffling datasets, loading bitsandbytes quantization buffers...']);
        } else if (next === 40) {
          setTrainingLogs(logs => [...logs, `[Loss Decay] Epoch 1 completed. Active Loss: 0.94. Validation Accuracy: 84.1%`]);
        } else if (next === 60) {
          setTrainingLogs(logs => [...logs, '[Step] Epoch 2/3: Active tuning of attention weight layers (' + targetModules + ')...']);
        } else if (next === 80) {
          setTrainingLogs(logs => [...logs, `[Loss Decay] Epoch 2 completed. Active Loss: 0.38. Validation Accuracy: 94.6%`]);
        } else if (next === 90) {
          setTrainingLogs(logs => [...logs, '[Step] Epoch 3/3: Running backpropagation loss optimization steps...']);
        } else if (next === 100) {
          clearInterval(interval);
          setTrainingLogs(logs => [
            ...logs,
            `[Loss Decay] Epoch 3 completed. Final Loss: 0.14. Valuation accuracy: 98.7%`,
            '[Status] Merging LoRA weights securely into base model gemini-3.5-flash-adapted...',
            '[System] Adapter successfully registered. Ready for immediate vLLM server deployment!'
          ]);
          setIsTraining(false);
          // Auto register new custom adapter
          setActiveAdapters(prev => ({
            ...prev,
            'company-sap-knowledge-lora': true
          }));
        }
        return next;
      });
    }, 1500);
  };

  // --- Adapter Router Testing Bench ---
  const executeAdapterRoutingTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsRouting(true);
    setRoutingResult(null);

    setTimeout(() => {
      const qLower = testQuery.toLowerCase();
      let targetedAdapter = 'company-sap-knowledge-lora';
      let confidence = 0.95;
      let rationale = 'Matches enterprise custom operating guidelines documented in local archives.';

      if (qLower.includes('sales') || qLower.includes('va01') || qLower.includes('order')) {
        targetedAdapter = 'sap-sd-lora';
        confidence = 0.98;
        rationale = 'Identified strong functional intent for Sales & Distribution (SD) business objects.';
      } else if (qLower.includes('purchase') || qLower.includes('po') || qLower.includes('me21n') || qLower.includes('material')) {
        targetedAdapter = 'sap-mm-lora';
        confidence = 0.96;
        rationale = 'Matches Materials Management (MM) supply chain structures.';
      } else if (qLower.includes('abap') || qLower.includes('dump') || qLower.includes('program') || qLower.includes('code')) {
        targetedAdapter = 'sap-abap-lora';
        confidence = 0.99;
        rationale = 'Technical code footprint detected. ABAP compiler adapter prioritized.';
      } else if (qLower.includes('idoc') || qLower.includes('failure') || qLower.includes('route')) {
        targetedAdapter = 'sap-idoc-lora';
        confidence = 0.94;
        rationale = 'Identified ALE/EDI integration mapping failure syntax.';
      } else if (qLower.includes('finance') || qLower.includes('journal') || qLower.includes('fb50') || qLower.includes('tax')) {
        targetedAdapter = 'sap-fico-lora';
        confidence = 0.97;
        rationale = 'Financial Posting semantic indicators match SAP FI/CO expert adapter.';
      }

      setRoutingResult({
        query: testQuery,
        adapter: targetedAdapter,
        confidence,
        rationale,
        flow: [
          { step: '1. Intent Classification', desc: 'Analyzed query tokens against 24 SAP module vectors.' },
          { step: '2. Profile Memory Context', desc: `Injected favorite TCodes [${longTermProfile.favTcodes.join(',')}] & Division [${longTermProfile.typicalContext}].` },
          { step: '3. Adapter Selection', desc: `Routed with ${(confidence * 100).toFixed(0)}% weight matching schema of adapter: [${targetedAdapter}].` },
          { step: '4. Hybrid Retrieval', desc: 'Retrieved standard SAP Help manuals + local document mappings.' },
          { step: '5. S8H Catalog Validation', desc: 'Verified core table schema constraints via OData metadata checks.' },
          { step: '6. Multi-Agent Audit', desc: 'Audit compliance checked by Security and Basis systems.' }
        ]
      });
      setIsRouting(false);
    }, 1200);
  };

  // --- Guest Session Memory Management ---
  const clearGuestMemory = () => {
    setGuestSession({
      module: 'General (Reset)',
      system: 'None (Reset)',
      recentQueries: [],
      discussedTcode: 'None'
    });
    alert('Temporary Short-Term Guest memory variables purged successfully from Redis transaction ledger.');
  };

  // --- Long-Term Memory Profile Actions ---
  const updateLongTermProfile = (key: string, value: string | string[]) => {
    setLongTermProfile({
      ...longTermProfile,
      [key]: value
    });
  };

  const deleteLongTermProfile = () => {
    if (confirm('Are you and your security manager sure you want to permanently revoke consent and delete your S/4HANA profile memories? This is zero-rollback.')) {
      setHasLongTermConsent(false);
      setLongTermProfile({
        frequentModule: '',
        favTcodes: [],
        roles: [],
        typicalContext: '',
        isolationKey: ''
      });
    }
  };

  // --- Continuous Learning Expert Adjustments ---
  const approveLearningItem = (id: string) => {
    setLearningQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item));
    const approved = learningQueue.find(item => item.id === id);
    if (approved) {
      // Create new QaPair
      const newPair: QaPair = {
        id: `q-learning-${id}`,
        instruction: approved.query,
        response: approved.expertCorrection,
        verified: true,
        module: approved.sourceModule
      };
      setQaPairs([newPair, ...qaPairs]);
      setFeedbackSuccessMsg(`Correction approved! Dataset row added & queued for periodic LoRA retraining.`);
      setTimeout(() => setFeedbackSuccessMsg(''), 3000);
    }
  };

  const rejectLearningItem = (id: string) => {
    setLearningQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'Rejected' } : item));
  };


  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 md:p-8 space-y-8 animate-in fade-in duration-300 shadow-xl max-w-6xl mx-auto text-slate-800">
      
      {/* Platform Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="bg-[#002f5a] text-white p-2 rounded-xl">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight font-mono">
              SAP Expert Model Adaptation Studio
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-bold max-w-2xl font-sans mt-1">
            Fine-tune foundational LLMs into dedicated S/4HANA & ECC domain specialists. Manage short/long-term corporate context caches and verify adapter integrations.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex flex-wrap gap-1 border border-slate-300">
          <button 
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all tracking-tight ${activeTab === 'pipeline' ? 'bg-[#002f5a] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            1. Data Pipeline
          </button>
          <button 
            onClick={() => setActiveTab('lora')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all tracking-tight ${activeTab === 'lora' ? 'bg-[#002f5a] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            2. LoRA Settings & Jobs
          </button>
          <button 
            onClick={() => setActiveTab('router')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all tracking-tight ${activeTab === 'router' ? 'bg-[#002f5a] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            3. Adapter Router
          </button>
          <button 
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all tracking-tight ${activeTab === 'memory' ? 'bg-[#002f5a] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            4. Memory & Profile
          </button>
          <button 
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all tracking-tight ${activeTab === 'evaluation' ? 'bg-[#002f5a] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            5. Benchmark Scorecard
          </button>
          <button 
            onClick={() => setActiveTab('learning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all tracking-tight ${activeTab === 'learning' ? 'bg-[#002f5a] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
          >
            6. Learning Loop
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: DATA PIPELINE (INGESTION, CLEANING, MASKING, Q&A)
          ======================================================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upload form */}
            <div className="bg-white p-5 border rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">1.1 Ingest SAP Documents</span>
                <h3 className="text-sm font-black text-slate-800 uppercase">Load Training Context</h3>
                <p className="text-[11px] text-slate-400 font-medium">Add specifications, code logs, config guides, standard policies, or ticket dumps.</p>
              </div>

              <form onSubmit={handleDocUpload} className="space-y-3">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Filename / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SPRO_TaxDefinitionRules_T005I.txt" 
                    value={uploadName} 
                    onChange={e => setUploadName(e.target.value)}
                    required
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Target SAP Module</label>
                    <select 
                      value={uploadModule} 
                      onChange={e => setUploadModule(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none cursor-pointer"
                    >
                      <option value="SD">Sales & Dist (SD)</option>
                      <option value="MM">Materials (MM)</option>
                      <option value="FI/CO">Finance (FI/CO)</option>
                      <option value="ABAP">ABAP Specialist</option>
                      <option value="Basis">Basis / Admin</option>
                      <option value="IDocs">Integration / PI</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-[9px] text-emerald-600 font-mono font-black uppercase bg-emerald-50 border border-emerald-100 rounded px-2 py-2 text-center">Governance On</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Document Body Content</label>
                  <textarea 
                    placeholder="Paste functional tables, code exceptions or steps..."
                    rows={4}
                    value={uploadContent}
                    onChange={e => setUploadContent(e.target.value)}
                    required
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#002f5a] hover:bg-blue-900 text-white font-black text-xs uppercase py-2.5 rounded-xl transition-all shadow flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ingest Document</span>
                </button>
              </form>
            </div>

            {/* Document Registry Table */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm lg:col-span-2 space-y-4 flex flex-col">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">1.2 Ingested Document Pool</span>
                  <h3 className="text-sm font-black text-slate-800 uppercase">Dataset Lineage & Sanitize</h3>
                </div>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase font-mono">
                  {docs.length} Active Contexts
                </span>
              </div>

              <div className="overflow-x-auto flex-1 border rounded-xl">
                <table className="w-full text-xs font-semibold text-left">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-mono text-[9px] border-b">
                    <tr>
                      <th className="p-3">File Name</th>
                      <th className="p-3">Module</th>
                      <th className="p-3">Governance Status</th>
                      <th className="p-3">Masked Items</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {docs.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold max-w-[150px] truncate">{doc.name}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded uppercase">
                            {doc.module}
                          </span>
                        </td>
                        <td className="p-3">
                          {doc.status === 'Unprocessed' ? (
                            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-black uppercase">
                              Unsanitized
                            </span>
                          ) : doc.status === 'Scanned & Masked' ? (
                            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-black uppercase">
                              Cleaned & Safe
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-black uppercase">
                              Q&A Extracted
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-400">
                          {doc.maskedCount > 0 ? (
                            <span className="text-red-500">{doc.maskedCount} Redacted</span>
                          ) : '0'}
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {doc.status === 'Unprocessed' && (
                            <button 
                              onClick={() => runDataMaskingAndCleaning(doc.id)}
                              className="bg-amber-100 hover:bg-amber-600 hover:text-white text-amber-900 border border-amber-200 text-[10px] font-black uppercase px-2 py-1 rounded-lg transition-all"
                            >
                              Scan PII
                            </button>
                          )}
                          {doc.status === 'Scanned & Masked' && (
                            <button 
                              onClick={() => generateQaDataset(doc.id)}
                              className="bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-900 border border-blue-200 text-[10px] font-black uppercase px-2 py-1 rounded-lg transition-all"
                            >
                              Generate Q&A
                            </button>
                          )}
                          <button 
                            onClick={() => setDocs(docs.filter(d => d.id !== doc.id))}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4 inline-block" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Masking Preview & Logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 border rounded-2xl shadow-sm">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-black text-rose-500 tracking-wider font-mono flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-rose-500" />
                S4-AD-GOVERNANCE MASKING RULES
              </span>
              <h3 className="text-sm font-black uppercase">Real-Time Data Redaction Sandbox</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                To prevent model ingestion of confidential materials, our system automatically runs a dynamic regex parser before dataset formatting:
              </p>
              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono font-bold text-slate-600">
                <div className="bg-slate-50 p-2.5 border rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-rose-500 block">Personal Profile PII</span>
                  <span>"smith@company.com" → "[REDACTED_EMPLOYEE_EMAIL]"</span>
                </div>
                <div className="bg-slate-50 p-2.5 border rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-rose-500 block">Accounts / Financials</span>
                  <span>"$50,000 / ID-3992" → "[REDACTED_FINANCIAL_INFO]"</span>
                </div>
                <div className="bg-slate-50 p-2.5 border rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-rose-500 block">Network / Systems</span>
                  <span>"172.16.89.4" → "[REDACTED_IP_ADDR]"</span>
                </div>
                <div className="bg-slate-50 p-2.5 border rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-emerald-500 block">Clean Core Integrity</span>
                  <span>Validates schemas against trusted S/4 Gateway structures.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-4 rounded-xl border border-slate-950 overflow-y-auto max-h-[180px] space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-blue-400 font-bold block mb-2 border-b border-slate-800 pb-1 uppercase tracking-wider text-[9px]">Governance Audit Logs</span>
                {maskingLogs.length === 0 ? (
                  <span className="text-slate-500 italic">Static logs parsed. Ready to review and scrub ingested records...</span>
                ) : (
                  maskingLogs.map((log, lIdx) => (
                    <div key={lIdx} className="text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-2">
                      {log}
                    </div>
                  ))
                )}
              </div>
              <div className="text-[8px] text-slate-500 text-right pt-2 border-t border-slate-800 uppercase font-black">
                Tenant Isolation Node: Active
              </div>
            </div>
          </div>

          {/* SFT Standard Q&A Dataset List */}
          <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">1.3 Compiled SFT Instruction Sets</span>
                <h3 className="text-sm font-black text-slate-800 uppercase">Dataset Split Previews (Train/Val Ratio: 80/20)</h3>
              </div>
              <button 
                onClick={() => setQaPairs([
                  { id: 'mq-3', instruction: 'How is ST22 dynamic memory configured in Basis?', response: 'Adjust profiles parameters.', verified: true, module: 'Basis' },
                  ...qaPairs
                ])}
                className="text-[#002f5a] font-black text-xs flex items-center hover:underline"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Manual Sample
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qaPairs.map(qa => (
                <div key={qa.id} className="bg-slate-50 border p-4 rounded-xl space-y-2 text-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono bg-[#002f5a] text-white px-2 py-0.5 rounded text-[8px] uppercase tracking-widest">{qa.module} TARGET</span>
                      <span className="text-slate-400 font-serif italic text-[10px]">#Instruction-Answer</span>
                    </div>
                    <p className="font-black text-slate-850 mt-1">Q: {qa.instruction}</p>
                    <p className="text-slate-600 font-semibold leading-relaxed">A: {qa.response}</p>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold">Verification: {qa.verified ? 'Verified with S8H OData Catalog' : 'Simulated Target Input'}</span>
                    <button 
                      onClick={() => setQaPairs(qaPairs.map(q => q.id === qa.id ? { ...q, verified: !q.verified } : q))}
                      className={`font-black px-2 py-0.5 rounded uppercase tracking-wider transition-all duration-200 ${qa.verified ? 'bg-green-150 text-green-700 border border-green-300 font-bold' : 'bg-slate-200 text-slate-600 hover:bg-[#002f5a] hover:text-white font-bold'}`}
                    >
                      {qa.verified ? '✓ Approved' : 'Click to Verify'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: LORA / QLORA CONFIGURATION & ACTIVE TRAINING JOBS
          ======================================================== */}
      {activeTab === 'lora' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Fine Tuning Config */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">2.1 PEFT Hyperparameters</span>
                <h3 className="text-sm font-black text-slate-800 uppercase">Adapters Architecture</h3>
                <p className="text-[11px] text-slate-400 font-medium">Fine-tune foundational intelligence arrays utilizing PEFT adapters safely.</p>
              </div>

              <div className="space-y-3 font-semibold text-xs">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Tuning Mechanism</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setTuningMode('lora')}
                      className={`p-2.5 rounded-xl border text-[10px] font-black uppercase tracking-tight flex items-center justify-center ${tuningMode === 'lora' ? 'bg-[#002f5a] text-white border-blue-900 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                    >
                      <Cpu className="w-3.5 h-3.5 mr-2" /> LoRA (Higher Quality)
                    </button>
                    <button 
                      onClick={() => setTuningMode('qlora')}
                      className={`p-2.5 rounded-xl border text-[10px] font-black uppercase tracking-tight flex items-center justify-center ${tuningMode === 'qlora' ? 'bg-[#002f5a] text-white border-blue-900 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                    >
                      <Layers className="w-3.5 h-3.5 mr-2" /> QLoRA (4-bit Low GPU)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Base Model Array</label>
                  <select 
                    value={baseModel}
                    onChange={e => setBaseModel(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none"
                  >
                    <option value="gemini-3.5-flash-adapted">gemini-3.5-flash (Standard Enterprise Base)</option>
                    <option value="gemini-3.1-pro-s4-expert">gemini-3.1-pro (S4 Spec Expert Base)</option>
                    <option value="llama-3-8b-instruct-sap-tune">Llama-3-8B-Instruct (Local / On-Premise DGX)</option>
                    <option value="gemma-2-9b-it-uncensored">Gemma-2-9B-It (Public Sandboxed System)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">LoRA Dimension Rank (r)</label>
                    <input 
                      type="number" 
                      value={loraRank} 
                      onChange={e => setLoraRank(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">LoRA Alpha Threshold</label>
                    <input 
                      type="number" 
                      value={loraAlpha} 
                      onChange={e => setLoraAlpha(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Learning Rate</label>
                    <input 
                      type="text" 
                      value={learningRate} 
                      onChange={e => setLearningRate(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Tuning Epochs</label>
                    <input 
                      type="number" 
                      value={epochs} 
                      onChange={e => setEpochs(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Target Weight Matrices</label>
                  <input 
                    type="text" 
                    value={targetModules} 
                    onChange={e => setTargetModules(e.target.value)}
                    placeholder="e.g. q_proj, v_proj, k_proj"
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <button 
                  onClick={triggerFineTuningJob}
                  disabled={isTraining}
                  className="w-full bg-blue-700 hover:bg-[#002f5a] text-white font-black text-xs uppercase py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <RefreshCcw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
                  <span>{isTraining ? 'Training Adapter...' : 'Start Retraining Pipeline'}</span>
                </button>
              </div>
            </div>

            {/* In-Studio Monitor & Live Logs */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm lg:col-span-2 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">2.2 Training Job Telemetry</span>
                <h3 className="text-sm font-black text-slate-800 uppercase">Active GPU Compute Telemetry</h3>
              </div>

              {/* Progress Panel */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${isTraining ? 'bg-blue-600 animate-pulse' : 'bg-slate-400'}`}></span>
                    {isTraining ? 'Job Status: ACCELERATING WEIGHT TUNING' : 'Job Status: COMPLETED / IDLE'}
                  </span>
                  <span className="font-mono text-slate-400">{trainProgress}% Completed</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${trainProgress}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] font-bold">
                  <div className="bg-white border rounded p-2 text-center">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-sans">Current Loss</span>
                    <span className="text-blue-700">{trainLoss.toFixed(4)}</span>
                  </div>
                  <div className="bg-white border rounded p-2 text-center">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-sans">Batch Size / lr</span>
                    <span>16 / {learningRate}</span>
                  </div>
                  <div className="bg-white border rounded p-2 text-center">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-sans">Hardware Ingestion</span>
                    <span className="text-emerald-600">8x TensorCore TPU</span>
                  </div>
                </div>
              </div>

              {/* Training Logs Window */}
              <div className="bg-slate-900 border border-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-300 space-y-2 h-[150px] overflow-y-auto">
                <span className="text-rose-400 block font-bold border-b border-rose-950 pb-1 uppercase tracking-wider text-[8px]">Active TPU Node Stream</span>
                {trainingLogs.length === 0 ? (
                  <span className="text-slate-500 italic">[Process IDLE] Click "Start Retraining Pipeline" to kick off local LoRA adaptation.</span>
                ) : (
                  trainingLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed text-slate-200 border-l-2 border-red-500 pl-2">
                      {log}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-3 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Model Lineage Registry Check: PASSED</span>
                <span>Checksum ID: SHA-BTP-2026-X8</span>
              </div>
            </div>
          </div>

          {/* Active Adapters List */}
          <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4">
            <div className="space-y-1 pb-2 border-b">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider font-mono">2.3 Published PEFT Adapters Registry</span>
              <h3 className="text-sm font-black uppercase">Fitted S/4HANA Domain Drivers</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(activeAdapters).map(([id, active]) => (
                <div key={id} className={`p-4 border rounded-2xl flex flex-col justify-between space-y-3 transition-all ${active ? 'bg-gradient-to-br from-white to-blue-50/20 border-blue-200 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-black text-slate-900 uppercase block">{id}</span>
                      <p className="text-[10px] font-bold text-slate-400">
                        {id === 'company-sap-knowledge-lora' 
                          ? 'Includes custom Strategic Sourcing specs & ABAP core requirements.' 
                          : `Pre-tuned expert adapter for SAP functional targets.`}
                      </p>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`}></span>
                  </div>

                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold tracking-tight bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Precision: {id.includes('qlora') ? '4-bit INT' : '16-bit FLOAT'}
                    </span>
                    <button 
                      onClick={() => setActiveAdapters({ ...activeAdapters, [id]: !active })}
                      className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full transition-all tracking-wider ${active ? 'bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white' : 'bg-blue-600 text-white hover:bg-blue-800'}`}
                    >
                      {active ? 'Retire Adapter' : 'Deploy Adapter'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 3: ADAPTER ROUTER (INTENT DETECTION SANDBOX)
          ======================================================== */}
      {activeTab === 'router' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input sandbox query */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">3.1 Adapter Router Sandbox</span>
                <h3 className="text-sm font-black text-slate-800 uppercase">Interactive Query Tester</h3>
                <p className="text-[11px] text-slate-400 font-medium">Type a prompt to watch the router predict the optimal adapter, inject session memories, perform enterprise RAG, and audit compliance flows.</p>
              </div>

              <form onSubmit={executeAdapterRoutingTest} className="space-y-3 font-semibold text-xs">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Sample Query Text</label>
                  <textarea 
                    value={testQuery}
                    onChange={e => setTestQuery(e.target.value)}
                    rows={4}
                    placeholder="e.g. Why are our Sales Orders in program MV45AFZZ failing with dypro exceptions under high credit limits?"
                    required
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  ></textarea>
                </div>

                <div className="bg-slate-50 border rounded-xl p-3 space-y-2">
                  <span className="text-[8px] uppercase font-mono text-slate-400 font-black tracking-wider block">Quick Presets</span>
                  <div className="flex flex-col gap-1">
                    <button 
                      type="button"
                      onClick={() => setTestQuery('We need to post a Journal Entry in client 100 via standard FB50 transaction.')}
                      className="text-left text-[10px] text-slate-650 hover:text-blue-700 bg-white hover:bg-slate-100 p-1.5 rounded border transition-all truncate"
                    >
                      Preset [FI/CO]: "We need to post FB50 Journal Entry..."
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTestQuery('Explain the ST22 dump exception details and user exit procedures inside MV45AFZZ.')}
                      className="text-left text-[10px] text-slate-650 hover:text-blue-700 bg-white hover:bg-slate-100 p-1.5 rounded border transition-all truncate"
                    >
                      Preset [ABAP]: "Explain ST22 dump exception details..."
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTestQuery('Explain how the Strategic Sourcing Fair Price Range ensures FRP procurement standard conformance.')}
                      className="text-left text-[10px] text-slate-650 hover:text-blue-700 bg-white hover:bg-slate-100 p-1.5 rounded border transition-all truncate"
                    >
                      Preset [MM/RAG]: "FRP procurement standard..."
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isRouting}
                  className="w-full bg-[#002f5a] hover:bg-blue-900 text-white font-black text-xs uppercase py-2.5 rounded-xl transition-all shadow flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isRouting ? 'Classifying Vectors...' : 'Run Intent Routing Check'}</span>
                </button>
              </form>
            </div>

            {/* Results router flow */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm lg:col-span-2 space-y-4">
              <div className="space-y-1 pb-2 border-b">
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">3.2 Live Pipeline Flow Trace</span>
                <h3 className="text-sm font-black text-slate-800 uppercase">Hybrid Query Execution Logic</h3>
              </div>

              {!routingResult && !isRouting ? (
                <div className="flex flex-col items-center justify-center h-[280px] bg-slate-50 border border-dashed rounded-xl p-6 text-center text-slate-400">
                  <Shuffle className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="font-bold text-xs uppercase">Sandbox Empty</span>
                  <p className="text-[11px] text-slate-400 font-medium max-w-sm mt-1">Submit or select a preset query on the left to trace the dynamic hybrid router validation process.</p>
                </div>
              ) : isRouting ? (
                <div className="flex flex-col items-center justify-center h-[280px]">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-4">Running Intent Classifiers...</span>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1">
                      <span className="text-[9px] uppercase font-mono font-black tracking-wider text-blue-600">Selected Adapter Match</span>
                      <h4 className="text-sm font-black text-[#002f5a] truncate uppercase font-mono">{routingResult.adapter}</h4>
                      <p className="text-[11px] text-slate-600 font-semibold">{routingResult.rationale}</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-1">
                      <span className="text-[9px] uppercase font-mono font-black tracking-wider text-emerald-600">Routing Confidence Index</span>
                      <h4 className="text-xl font-bold text-emerald-600 font-mono">{(routingResult.confidence * 100).toFixed(1)}%</h4>
                      <p className="text-[11px] text-slate-600 font-semibold">Calculated from neural similarity maps.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Orchestrator Hybrid Execution Logs</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
                      {routingResult.flow.map((flowItem: any, fIdx: number) => (
                        <div key={fIdx} className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-800 uppercase block text-[10px] font-mono">{flowItem.step}</span>
                            <span className="text-slate-500 font-semibold text-[10.5px] leading-tight block">{flowItem.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: GUEST AND USER MEMORY AND CONSENT STUDIO
          ======================================================== */}
      {activeTab === 'memory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* User details and profile consent */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-5 flex flex-col justify-between h-full">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">4.1 User Governance & Consent</span>
                <h3 className="text-sm font-black text-slate-800 uppercase">Corporate Profile Retention</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Personalize the copilot interface with long-term memory configurations. For safety compliance, profiles are isolation encapsulated.
                </p>
              </div>

              {/* Consent Toggles */}
              <div className="bg-slate-50 p-4 border rounded-xl space-y-4 font-semibold text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-black text-slate-800 uppercase block text-[11px]">Authorize Long-Term Memories</label>
                    <span className="text-[10px] text-slate-400 block font-normal leading-tight">Retain role modules, common contexts, and favorite transaction codes.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={hasLongTermConsent}
                    onChange={e => setHasLongTermConsent(e.target.checked)}
                    className="w-4.5 h-4.5 text-blue-600 rounded bg-slate-150 cursor-pointer"
                  />
                </div>

                {hasLongTermConsent ? (
                  <div className="bg-emerald-50 text-emerald-700 p-2.5 border border-emerald-200 rounded-lg text-[10px] flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Consent Active: Standard PG database user profile active, encrypted at rest via AES-256 GRC key frameworks.</span>
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-600 p-2.5 border border-amber-200 rounded-lg text-[10px] flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Profile PURGED or consent disabled. Memory is falling back strictly to Short-Term temporary session caches.</span>
                  </div>
                )}
              </div>

              {hasLongTermConsent && (
                <div className="space-y-2">
                  <button 
                    onClick={deleteLongTermProfile}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs uppercase py-2 rounded-xl transition-all border border-rose-100 flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe Long-Term Storage</span>
                  </button>
                </div>
              )}
            </div>

            {/* Long term memory displays (Encrypted PostgreSQL) */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider font-mono">4.2 Encrypted Profile Memory (Persistent)</span>
                  <h3 className="text-sm font-black text-slate-800 uppercase">Long-Term Workspace Context</h3>
                </div>
                <Lock className="w-4 h-4 text-purple-600 shrink-0" />
              </div>

              {hasLongTermConsent ? (
                <div className="space-y-3 font-semibold text-xs text-slate-700 leading-relaxed font-sans">
                  
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Assigned GRC Role Mapping</label>
                    <input 
                      type="text" 
                      value={longTermProfile.roles.join(', ')}
                      onChange={e => updateLongTermProfile('roles', e.target.value.split(', '))}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Favorite TCodes (Comma separated)</label>
                    <input 
                      type="text" 
                      value={longTermProfile.favTcodes.join(', ')}
                      onChange={e => updateLongTermProfile('favTcodes', e.target.value.split(', '))}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Frequent SAP Modules</label>
                    <input 
                      type="text" 
                      value={longTermProfile.frequentModule}
                      onChange={e => updateLongTermProfile('frequentModule', e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1 font-mono">Division & Division Context</label>
                    <textarea 
                      value={longTermProfile.typicalContext}
                      onChange={e => updateLongTermProfile('typicalContext', e.target.value)}
                      rows={2}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none"
                    ></textarea>
                  </div>

                  <div className="bg-slate-50 p-2 border rounded-xl flex justify-between font-mono text-[9px] text-slate-500 uppercase">
                    <span>Tenant Tenant Key:</span>
                    <span className="font-bold text-slate-700">{longTermProfile.isolationKey}</span>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl h-[260px] text-center border-2 border-dashed text-slate-400">
                  <Lock className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="font-bold">Persistent Storage Locked</span>
                  <p className="text-[10px] text-slate-400 font-medium max-w-[200px] mt-1">To populate persistent preferences, click 'Authorize Long-Term Memories' on the left panel.</p>
                </div>
              )}
            </div>

            {/* Short term memory displays (Guest / Temporary) */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider font-mono">4.3 Volatile Session Storage (Temporary)</span>
                  <History className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase">Guest Session Variables</h3>
              </div>

              <div className="space-y-4 font-semibold text-xs leading-relaxed text-slate-700">
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-mono">ACTIVE TRANSACTION CONTEXTS</span>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Selected System:</span>
                    <span className="text-slate-800">{guestSession.system}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Active Topic Module:</span>
                    <span className="text-slate-800">{guestSession.module}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Discussed Tcode:</span>
                    <span className="text-slate-800">{guestSession.discussedTcode}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-mono">RECENT SESSION CONVERSATION BOUNDS</span>
                  {guestSession.recentQueries.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">No recent conversational buffers.</span>
                  ) : (
                    guestSession.recentQueries.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white border rounded px-2.5 py-1.5 text-[10px] truncate max-w-full font-mono text-slate-650">
                        → {q}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border rounded-xl bg-orange-50 text-[10px] text-orange-600/90 leading-tight block">
                  Volatile Notice: Standard Redis session bounds will clear automatically on system timeout or tab termination. No database variables are saved.
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={clearGuestMemory}
                  className="w-full bg-white hover:bg-orange-600 hover:text-white hover:border-orange-600 text-orange-700 border border-orange-200 text-xs font-black py-2 rounded-xl transition-all uppercase"
                >
                  Clear Temporary Redis Session Memory
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: SAP-SPECIFIC EVALUATIONS & BENCHMARK RADAR REPORT
          ======================================================== */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Model evaluations overview card */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm md:col-span-1 space-y-4">
              <span className="text-[10px] uppercase font-black text-[#002f5a] tracking-wider font-mono">5.1 Benchmark Scorecard</span>
              <h3 className="text-sm font-black uppercase">SAP Functional Accuracy</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                We compare our SAP Fine-Tuned Domain specialist model adaptions directly against standard foundation models using internal S/4 verification suites.
              </p>
              
              <div className="space-y-2.5 pt-3">
                <div className="p-3.5 bg-[#002f5a] text-white rounded-2xl">
                  <span className="text-[9px] uppercase tracking-widest text-blue-400 block font-mono">Fine-Tuned Adapter Avg score</span>
                  <h4 className="text-2xl font-black font-mono">95.3% Conformance</h4>
                </div>
                <div className="p-3.5 bg-slate-50 border rounded-2xl text-slate-500">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-mono">Foundational Base LLM Avg score</span>
                  <h4 className="text-2xl font-black font-mono text-slate-700">54.7% Conformance</h4>
                </div>
              </div>

              <div className="pt-2 text-[10px] leading-snug font-medium text-slate-400">
                Tests derived from 4,500 functional configurations, SPRO table audits, dynamic MV45AFZZ code checks, and standard business execution pathways.
              </div>
            </div>

            {/* Radar metrics grid */}
            <div className="bg-white p-5 border rounded-2xl shadow-sm md:col-span-2 space-y-5">
              <div className="flex justify-between items-center pb-2 border-b">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">5.2 Comparative Metric Radars</span>
                  <h3 className="text-sm font-black text-slate-800 uppercase">Verification Metric Dimension Levels</h3>
                </div>
                <span className="text-[10px] text-slate-400 italic">Score Range: 0 - 100% Correctness</span>
              </div>

              {/* Benchmarks metrics table custom visual progress */}
              <div className="space-y-4 text-xs font-semibold">
                
                {/* 1. Functional accuracy */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-800 font-bold block">1. SAP Functional Accuracy (Logistics, SD, MM, FI)</span>
                    <span className="text-blue-700 font-bold">Fine-Tuned: 94.2% <span className="text-slate-400 text-[10px] font-normal">vs Base: 62.1%</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
                    <div className="bg-[#002f5a] h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '94.2%' }}></div>
                    <div className="bg-blue-300/40 h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '62.1%' }}></div>
                  </div>
                </div>

                {/* 2. TCode Correction */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-800 font-bold block">2. Standard TCode Exactly-Match precision</span>
                    <span className="text-blue-700 font-bold">Fine-Tuned: 98.7% <span className="text-slate-400 text-[10px] font-normal">vs Base: 41.5%</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
                    <div className="bg-[#002f5a] h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '98.7%' }}></div>
                    <div className="bg-blue-300/40 h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '41.5%' }}></div>
                  </div>
                </div>

                {/* 3. ABAP program correctness */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-800 font-bold block">3. Custom ABAP dynamic compilation validation</span>
                    <span className="text-blue-700 font-bold">Fine-Tuned: 95.4% <span className="text-slate-400 text-[10px] font-normal">vs Base: 53.2%</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
                    <div className="bg-[#002f5a] h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '95.4%' }}></div>
                    <div className="bg-blue-300/40 h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '53.2%' }}></div>
                  </div>
                </div>

                {/* 4. ECC vs S4 Distinctions */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-800 font-bold block">4. ECC vs S/4 Architecture Distinction Accuracy</span>
                    <span className="text-blue-700 font-bold">Fine-Tuned: 96.5% <span className="text-slate-400 text-[10px] font-normal">vs Base: 48.8%</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
                    <div className="bg-[#002f5a] h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '96.5%' }}></div>
                    <div className="bg-blue-300/40 h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '48.8%' }}></div>
                  </div>
                </div>

                {/* 5. Hallucination Rates */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-800 font-bold block">5. Average Hallucinations Rate (Lower is better)</span>
                    <span className="text-blue-700 font-bold">Fine-Tuned: 1.2% <span className="text-slate-400 text-[10px] font-normal">vs Base: 14.5%</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '1.2%' }}></div>
                    <div className="bg-rose-300/60 h-full rounded-full transition-all duration-300 absolute left-0 top-0" style={{ width: '14.5%' }}></div>
                  </div>
                </div>

              </div>

              <div className="pt-2 border-t flex justify-between items-center font-mono text-[9px] text-slate-400 uppercase">
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-[#002f5a] rounded mr-1"></span>Fine-Tuned Adapter</span>
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-blue-300 rounded mr-1"></span>Foundational Base</span>
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-black flex items-center">
                  <Download className="w-3.5 h-3.5 mr-1" /> Printable Scorecard
                </button>
              </div>

            </div>
          </div>

          {/* Cloud deployment endpoints overview */}
          <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4">
            <span className="text-[10px] uppercase font-black text-rose-500 tracking-wider font-mono block">5.3 ADAPTER HOSTING ENDPOINT DEPLOYMENT</span>
            <h3 className="text-sm font-black uppercase">DGX, GCP Vertex AI, & AWS SageMaker Adapter Service Engine</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold leading-relaxed">
              <div className="bg-slate-50 p-4 border rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-slate-800 uppercase font-mono">1. LOCAL COMPUTE DEPLOY</h4>
                <p className="text-[10.5px] text-slate-500">Serve adapter fine-tuning locally inside high-grade private GPU stacks via direct API ports (Port 3000 mapping).</p>
                <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono">Ready to Serve</span>
              </div>

              <div className="bg-slate-50 p-4 border rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-slate-800 uppercase font-mono">2. GCP Vertex AI Training</h4>
                <p className="text-[10.5px] text-slate-500">Federated deployment into Google Sovereign Cloud pipeline bucket layers, fully authorized with VPC controls.</p>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono">Available</span>
              </div>

              <div className="bg-slate-50 p-4 border rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-slate-800 uppercase font-mono">3. AWS SageMaker Adapters</h4>
                <p className="text-[10.5px] text-slate-500">Push compressed PEFT parameters smoothly to AWS multi-model endpoints behind public API gateways.</p>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono">Available</span>
              </div>

              <div className="bg-slate-50 p-4 border rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-slate-800 uppercase font-mono">4. vLLM Serving / TGI Server</h4>
                <p className="text-[10.5px] text-slate-500">Dynamic hot-loading PEFT adapters via query context, ensuring zero deployment footprint or cold reboots.</p>
                <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono font-bold">Premium Option</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 6: CONTINUOUS LEARNING LOOP (EXPERT ADJUSTMENTS)
          ======================================================== */}
      {activeTab === 'learning' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white p-5 border rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider font-mono">6.1 User Correction Feedback Pool</span>
                <h3 className="text-sm font-black text-slate-800 uppercase">Expert Retraining & Align Queue</h3>
              </div>
              <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase font-mono">
                {learningQueue.filter(item => item.status === 'Pending').length} Pending Reviews
              </span>
            </div>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed font-sans">
              Whenever standard copilot predictions receive a thumbs down or explicit correction from certified SAP domain designers, those prompts route here. Review, finalize the expert correction, and append them directly to the active retraining SFT dataset loop.
            </p>

            {feedbackSuccessMsg && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3.5 rounded-2xl text-xs font-bold animate-in fade-in duration-200">
                {feedbackSuccessMsg}
              </div>
            )}

            <div className="space-y-5">
              {learningQueue.map(item => (
                <div key={item.id} className={`p-4 border rounded-2xl space-y-4 transition-all ${item.status === 'Approved' ? 'bg-emerald-50/20 border-emerald-200' : item.status === 'Rejected' ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white border-slate-250 shadow-sm'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#002f5a] text-white text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded">
                        {item.id} ID Match
                      </span>
                      <span className="bg-slate-150 text-slate-600 text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded">
                        Target adapter: sap-{item.sourceModule.toLowerCase()}-lora
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase font-mono px-2.5 py-0.5 rounded ${item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Rejected' ? 'bg-rose-150 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block mb-0.5">Retrieved User Question</span>
                        <p className="text-slate-800 font-bold">"{item.query}"</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block mb-0.5">Default Model Answer</span>
                        <p className="text-slate-500 font-medium">"{item.originalAnswer}"</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 border rounded-xl space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-blue-600 block">Proposed SFT Retraining Answer</span>
                      <textarea 
                        value={item.expertCorrection}
                        onChange={e => setLearningQueue(learningQueue.map(q => q.id === item.id ? { ...q, expertCorrection: e.target.value } : q))}
                        disabled={item.status !== 'Pending'}
                        rows={3}
                        className="w-full text-xs font-semibold leading-relaxed bg-white border rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-600"
                      ></textarea>
                    </div>
                  </div>

                  {item.status === 'Pending' && (
                    <div className="flex justify-end space-x-2 pt-2 border-t">
                      <button 
                        onClick={() => rejectLearningItem(item.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase px-4 py-2 rounded-xl transition-all"
                      >
                        Ignore Correction
                      </button>
                      <button 
                        onClick={() => approveLearningItem(item.id)}
                        className="bg-emerald-650 hover:bg-emerald-700 text-white font-black text-xs uppercase px-4 py-2 rounded-xl transition-all flex items-center justify-center space-x-2"
                      >
                        <HeartHandshake className="w-4 h-4 text-emerald-300" />
                        <span>Commit & Inject SFT Dataset</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SFT Periodicretraining clock overview */}
          <div className="bg-gradient-to-r from-slate-900 to-[#002f5a] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-mono text-blue-400 font-black flex items-center">
                <Workflow className="w-4 h-4 mr-1 text-blue-400 shrink-0" />
                AUTOMATED RETRAINING SCHEDULER
              </span>
              <h3 className="text-base font-black uppercase">Continuous Adapter Optimisation Cycle</h3>
              <p className="text-xs text-slate-300 font-medium max-w-xl leading-relaxed">
                Retraining is scheduled automatically every Friday at 22:00 CET using committed alignment queues. Retains adapter versioning with multi-model rollback safety checkpoints.
              </p>
            </div>

            <div className="bg-white/10 p-4 border border-white/10 rounded-2xl text-center md:self-stretch flex flex-col justify-center min-w-[200px] shrink-0 backdrop-blur-md">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300 font-bold block">Retraining Status</span>
              <span className="text-sm font-black text-emerald-400 mt-1 uppercase">Ready (Active Feedbacks: {learningQueue.filter(item => item.status === 'Approved').length})</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
