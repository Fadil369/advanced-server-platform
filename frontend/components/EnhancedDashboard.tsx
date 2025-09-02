import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Activity, Shield, Globe, Zap, Heart, Users, BarChart3, 
  Settings, Search, Bell, Menu, X, ChevronRight, Play, Pause,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Database,
  Stethoscope, Dna, FileText, MessageSquare, Cpu, Cloud
} from 'lucide-react';

// Enhanced color system
const theme = {
  colors: {
    primary: '#0ea5e9',
    secondary: '#2b6cb8',
    accent: '#1a365d',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    neutral: '#64748b'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #2b6cb8 100%)',
    neural: 'linear-gradient(135deg, #1a365d 0%, #2b6cb8 50%, #0ea5e9 100%)',
    medical: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)'
  }
};

// Real-time data hooks
const useRealTimeData = () => {
  const [data, setData] = useState({
    agents: [],
    metrics: {},
    alerts: [],
    workflows: [],
    compliance: {}
  });

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/dashboard');
    ws.onmessage = (event) => setData(JSON.parse(event.data));
    return () => ws.close();
  }, []);

  return data;
};

// Enhanced Glass Card Component
const GlassCard = ({ children, className = "", gradient = false, ...props }) => (
  <motion.div
    className={`
      relative backdrop-blur-xl bg-white/5 border border-white/10 
      rounded-2xl shadow-2xl overflow-hidden group
      ${gradient ? 'bg-gradient-to-br from-white/10 to-white/5' : ''}
      ${className}
    `}
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    {children}
  </motion.div>
);

// AI Agent Status with Real-time Updates
const AIAgentCard = ({ agent, isActive, metrics, onExecute }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  
  const handleExecute = async () => {
    setIsExecuting(true);
    await onExecute(agent.id);
    setIsExecuting(false);
  };

  const iconMap = {
    MASTERLINC: Brain,
    HEALTHCARELINC: Heart,
    CLINICALLINC: Stethoscope,
    COMPLIANCELINC: Shield
  };
  
  const Icon = iconMap[agent.name] || Brain;
  
  return (
    <GlassCard className="p-6" gradient>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div 
            className={`p-3 rounded-xl ${isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}
            animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
          >
            <Icon size={24} className={isActive ? 'text-green-400' : 'text-gray-400'} />
          </motion.div>
          <div>
            <h3 className="font-bold text-white">{agent.name}</h3>
            <p className="text-sm text-gray-300">{agent.specialty}</p>
          </div>
        </div>
        
        <motion.button
          onClick={handleExecute}
          disabled={isExecuting}
          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isExecuting ? <Clock size={16} className="animate-spin" /> : <Play size={16} />}
        </motion.button>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-400">Tasks</p>
          <p className="text-lg font-bold text-white">{metrics.tasks || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Accuracy</p>
          <p className="text-lg font-bold text-white">{metrics.accuracy || 0}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Speed</p>
          <p className="text-lg font-bold text-white">{metrics.speed || 0}ms</p>
        </div>
      </div>
      
      {isActive && (
        <motion.div 
          className="h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </GlassCard>
  );
};

// Real-time Metrics Dashboard
const MetricsDashboard = ({ metrics }) => {
  const metricCards = [
    { label: 'Active Patients', value: metrics.patients || 0, change: '+12%', icon: Users, color: 'text-blue-400' },
    { label: 'FHIR Operations', value: metrics.fhirOps || 0, change: '+8%', icon: Database, color: 'text-green-400' },
    { label: 'Compliance Score', value: `${metrics.compliance || 100}%`, change: '+0.2%', icon: Shield, color: 'text-purple-400' },
    { label: 'Response Time', value: `${metrics.responseTime || 0}ms`, change: '-15%', icon: Zap, color: 'text-yellow-400' }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <metric.icon className={metric.color} size={24} />
              <span className={`text-xs px-2 py-1 rounded-full ${
                metric.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {metric.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
            <p className="text-sm text-gray-300">{metric.label}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};

// Interactive Workflow Builder
const WorkflowBuilder = ({ workflows, onCreateWorkflow }) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  
  const workflowNodes = [
    { id: 'patient-intake', label: 'Patient Intake', icon: Users, type: 'input' },
    { id: 'fhir-validation', label: 'FHIR Validation', icon: CheckCircle, type: 'process' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Brain, type: 'process' },
    { id: 'clinical-decision', label: 'Clinical Decision', icon: Stethoscope, type: 'decision' },
    { id: 'compliance-check', label: 'Compliance Check', icon: Shield, type: 'validation' },
    { id: 'output-report', label: 'Generate Report', icon: FileText, type: 'output' }
  ];
  
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Workflow Builder</h2>
        <motion.button
          onClick={() => setIsBuilding(!isBuilding)}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
          whileHover={{ scale: 1.05 }}
        >
          {isBuilding ? 'Save Workflow' : 'Build New'}
        </motion.button>
      </div>
      
      {isBuilding ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {workflowNodes.map((node) => (
            <motion.div
              key={node.id}
              className={`p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                selectedNodes.includes(node.id) 
                  ? 'border-blue-400 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              onClick={() => {
                setSelectedNodes(prev => 
                  prev.includes(node.id) 
                    ? prev.filter(id => id !== node.id)
                    : [...prev, node.id]
                );
              }}
              whileHover={{ scale: 1.05 }}
            >
              <node.icon size={20} className="text-gray-400 mb-2" />
              <p className="text-sm text-white">{node.label}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  workflow.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <span className="text-white">{workflow.name}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

// Smart Alerts System
const SmartAlerts = ({ alerts }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.type === filter
  );
  
  const alertTypes = [
    { type: 'all', label: 'All', count: alerts.length },
    { type: 'critical', label: 'Critical', count: alerts.filter(a => a.type === 'critical').length },
    { type: 'warning', label: 'Warning', count: alerts.filter(a => a.type === 'warning').length },
    { type: 'info', label: 'Info', count: alerts.filter(a => a.type === 'info').length }
  ];
  
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Smart Alerts</h2>
        <div className="flex space-x-2">
          {alertTypes.map(({ type, label, count }) => (
            <motion.button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-xs ${
                filter === type 
                  ? 'bg-blue-500/30 text-blue-400' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {label} ({count})
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'critical' ? 'border-red-400 bg-red-500/10' :
                alert.type === 'warning' ? 'border-yellow-400 bg-yellow-500/10' :
                'border-blue-400 bg-blue-500/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{alert.title}</p>
                  <p className="text-sm text-gray-300">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
                </div>
                {alert.type === 'critical' && (
                  <AlertTriangle size={16} className="text-red-400" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

// Main Enhanced Dashboard
const EnhancedDashboard = () => {
  const realTimeData = useRealTimeData();
  const [selectedView, setSelectedView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleAgentExecute = useCallback(async (agentId) => {
    const response = await fetch(`/api/agents/${agentId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'health_check' })
    });
    return response.json();
  }, []);
  
  const navigation = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'agents', label: 'AI Agents', icon: Brain },
    { id: 'workflows', label: 'Workflows', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];
  
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-teal-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>
      
      {/* Sidebar */}
      <motion.div
        className={`relative z-10 ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 64 }}
      >
        <GlassCard className="h-full m-4 p-6">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2"
              >
                <Brain className="text-blue-400" size={24} />
                <span className="font-bold">BrainSAIT</span>
              </motion.div>
            )}
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
            >
              <Menu size={16} />
            </motion.button>
          </div>
          
          <nav className="space-y-2">
            {navigation.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  selectedView === item.id 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <item.icon size={20} />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </nav>
        </GlassCard>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Healthcare AI Platform</h1>
            <p className="text-gray-400">Real-time monitoring and control</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm">All Systems Operational</span>
            </motion.div>
            
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
            >
              <Bell size={20} />
            </motion.button>
          </div>
        </div>
        
        {/* Content based on selected view */}
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MetricsDashboard metrics={realTimeData.metrics} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">AI Agents</h2>
                  <div className="grid gap-4">
                    {realTimeData.agents.map((agent) => (
                      <AIAgentCard
                        key={agent.id}
                        agent={agent}
                        isActive={agent.status === 'active'}
                        metrics={agent.metrics}
                        onExecute={handleAgentExecute}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <SmartAlerts alerts={realTimeData.alerts} />
                </div>
              </div>
              
              <WorkflowBuilder 
                workflows={realTimeData.workflows}
                onCreateWorkflow={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
