'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  Brain, Activity, Shield, Users, BarChart3, Settings, 
  Bell, Menu, TrendingUp, Zap, Heart, Stethoscope 
} from 'lucide-react';

import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/dashboard/MetricCard';
import { AgentCard } from '../components/dashboard/AgentCard';
import { AlertsPanel } from '../components/dashboard/AlertsPanel';
import { WorkflowBuilder } from '../components/dashboard/WorkflowBuilder';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';

// API functions
const fetchAgents = async () => {
  const response = await fetch('/api/enhanced/agents');
  return response.json();
};

const fetchMetrics = async () => {
  const response = await fetch('/api/enhanced/metrics/realtime');
  return response.json();
};

const fetchAlerts = async () => {
  const response = await fetch('/api/enhanced/alerts');
  return response.json();
};

const fetchWorkflows = async () => {
  const response = await fetch('/api/enhanced/workflows');
  return response.json();
};

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isConnected, data: wsData } = useWebSocket();

  // Queries with real-time updates
  const { data: agentsData, refetch: refetchAgents } = useQuery('agents', fetchAgents, {
    refetchInterval: 10000,
  });

  const { data: metricsData, refetch: refetchMetrics } = useQuery('metrics', fetchMetrics, {
    refetchInterval: 5000,
  });

  const { data: alertsData, refetch: refetchAlerts } = useQuery('alerts', fetchAlerts, {
    refetchInterval: 15000,
  });

  const { data: workflowsData } = useQuery('workflows', fetchWorkflows);

  // Update data when WebSocket receives updates
  useEffect(() => {
    if (wsData.type === 'agent_execution_complete' || wsData.type === 'agent_execution_error') {
      refetchAgents();
      refetchMetrics();
    }
    if (wsData.type === 'new_alert' || wsData.type === 'alert_dismissed') {
      refetchAlerts();
    }
  }, [wsData, refetchAgents, refetchMetrics, refetchAlerts]);

  const navigation = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'agents', label: 'AI Agents', icon: Brain },
    { id: 'workflows', label: 'Workflows', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (selectedView) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Patients"
                value={metricsData?.metrics?.healthcare?.patient_records_processed || 0}
                change="+12%"
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="FHIR Operations"
                value={metricsData?.metrics?.healthcare?.fhir_operations_per_minute || 0}
                change="+8%"
                icon={Activity}
                color="green"
              />
              <MetricCard
                title="Compliance Score"
                value={`${metricsData?.metrics?.healthcare?.compliance_score || 100}%`}
                change="+0.2%"
                icon={Shield}
                color="purple"
              />
              <MetricCard
                title="Response Time"
                value={`${metricsData?.metrics?.application?.response_time_avg || 0}ms`}
                change="-15%"
                icon={Zap}
                color="yellow"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* AI Agents */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">AI Agents</h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-sm text-gray-400">
                      {isConnected ? 'Real-time' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agentsData?.agents?.map((agent: any) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onExecute={async (taskType) => {
                        const response = await fetch(`/api/enhanced/agents/${agent.id}/execute`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ task_type: taskType }),
                        });
                        return response.json();
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Alerts Panel */}
              <div className="space-y-6">
                <AlertsPanel alerts={alertsData?.alerts || []} />
              </div>
            </div>

            {/* Workflow Builder */}
            <WorkflowBuilder workflows={workflowsData?.workflows || []} />
          </motion.div>
        );

      case 'agents':
        return (
          <motion.div
            key="agents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">AI Agents Management</h1>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                Create New Agent
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentsData?.agents?.map((agent: any) => (
                <GlassCard key={agent.id} className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-xl ${
                      agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {agent.name === 'MASTERLINC' && <Brain size={24} />}
                      {agent.name === 'HEALTHCARELINC' && <Heart size={24} />}
                      {agent.name === 'CLINICALLINC' && <Stethoscope size={24} />}
                      {agent.name === 'COMPLIANCELINC' && <Shield size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{agent.name}</h3>
                      <p className="text-sm text-gray-400">{agent.type}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={agent.status === 'active' ? 'text-green-400' : 'text-gray-400'}>
                        {agent.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tasks Completed</span>
                      <span className="text-white">{agent.metrics?.tasks_completed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-white">{agent.metrics?.success_rate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Response</span>
                      <span className="text-white">{agent.metrics?.avg_response_time || 0}ms</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                        Configure
                      </button>
                      <button className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm">
                        Execute
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">Content for {selectedView} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-teal-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      {/* Sidebar */}
      <Sidebar
        navigation={navigation}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 relative z-10 flex flex-col">
        <Header isConnected={isConnected} />
        
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
