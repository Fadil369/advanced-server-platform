import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  Shield, 
  Globe, 
  Zap, 
  Heart,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';

// NEURAL: BrainSAIT Color Palette
const colors = {
  midnightBlue: '#1a365d',
  medicalBlue: '#2b6cb8', 
  signalTeal: '#0ea5e9',
  deepOrange: '#ea580c',
  professionalGray: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

// BILINGUAL: RTL/LTR support
const useDirection = () => {
  const [isRTL, setIsRTL] = useState(false);
  return { isRTL, setIsRTL };
};

// NEURAL: Mesh Gradient Component with BrainSAIT colors
const MeshGradientBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden">
    {/* Primary Mesh Gradient */}
    <motion.div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, ${colors.midnightBlue}40 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${colors.medicalBlue}30 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, ${colors.signalTeal}20 0%, transparent 50%),
          linear-gradient(135deg, ${colors.midnightBlue}10 0%, transparent 100%)
        `
      }}
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%'],
      }}
      transition={{
        duration: 20,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'reverse'
      }}
    />
    
    {/* Wireframe Overlay */}
    <motion.div
      className="absolute inset-0 opacity-60"
      style={{
        background: `
          linear-gradient(90deg, transparent 49%, ${colors.signalTeal}20 50%, transparent 51%),
          linear-gradient(0deg, transparent 49%, ${colors.medicalBlue}15 50%, transparent 51%)
        `,
        backgroundSize: '50px 50px'
      }}
      animate={{
        backgroundPosition: ['0px 0px', '50px 50px'],
      }}
      transition={{
        duration: 15,
        ease: 'linear',
        repeat: Infinity,
      }}
    />
    
    {/* Accent Particles */}
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 3 === 0 ? colors.signalTeal : i % 3 === 1 ? colors.medicalBlue : colors.deepOrange,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  </div>
);

// NEURAL: Glass Morphism Card Component
const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`
      relative backdrop-blur-xl bg-white/10 border border-white/20 
      rounded-2xl shadow-2xl overflow-hidden
      ${className}
    `}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    {children}
  </motion.div>
);

// BRAINSAIT: Agent Status Card
const AgentCard = ({ agent, isActive, metrics }) => {
  const iconMap = {
    MASTERLINC: Brain,
    HEALTHCARELINC: Heart,
    CLINICALLINC: Activity,
    COMPLIANCELINC: Shield
  };
  
  const Icon = iconMap[agent.name] || Brain;
  
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`
            p-3 rounded-xl 
            ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}
          `}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white">{agent.name}</h3>
            <p className="text-sm text-gray-300">{agent.specialty}</p>
          </div>
        </div>
        
        <div className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}
        `}>
          {isActive ? 'Active' : 'Standby'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400">Tasks Today</p>
          <p className="text-lg font-bold text-white">{metrics.tasksToday}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Accuracy</p>
          <p className="text-lg font-bold text-white">{metrics.accuracy}%</p>
        </div>
      </div>
      
      {/* NEURAL: Real-time activity indicator */}
      {isActive && (
        <motion.div 
          className="mt-4 h-1 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </GlassCard>
  );
};

// BILINGUAL: Language Toggle Component
const LanguageToggle = ({ isRTL, setIsRTL }) => (
  <motion.button
    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
    onClick={() => setIsRTL(!isRTL)}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Globe size={16} />
    <span className="text-sm font-medium">{isRTL ? 'العربية' : 'English'}</span>
  </motion.button>
);

// MEDICAL: Clinical Metrics Dashboard
const ClinicalMetrics = () => {
  const metrics = [
    { label: 'Patients Processed', value: '2,847', change: '+12%', icon: Users },
    { label: 'FHIR Validations', value: '15,692', change: '+5%', icon: Activity },
    { label: 'Compliance Score', value: '99.8%', change: '+0.2%', icon: Shield },
    { label: 'Response Time', value: '1.2s', change: '-15%', icon: Zap }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className="text-blue-400" size={24} />
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${metric.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
              `}>
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

// BRAINSAIT: Main Dashboard Component
const BrainSAITDashboard = () => {
  const { isRTL, setIsRTL } = useDirection();
  const [selectedAgent, setSelectedAgent] = useState('MASTERLINC');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // AGENT: BrainSAIT Agents Configuration
  const agents = [
    { 
      name: 'MASTERLINC', 
      specialty: 'AI Orchestration',
      status: 'active',
      metrics: { tasksToday: 342, accuracy: 98.5 }
    },
    { 
      name: 'HEALTHCARELINC', 
      specialty: 'FHIR Processing',
      status: 'active',
      metrics: { tasksToday: 1247, accuracy: 99.2 }
    },
    { 
      name: 'CLINICALLINC', 
      specialty: 'Decision Support',
      status: 'active',
      metrics: { tasksToday: 89, accuracy: 96.8 }
    },
    { 
      name: 'COMPLIANCELINC', 
      specialty: 'Security & Audit',
      status: 'active',
      metrics: { tasksToday: 156, accuracy: 100 }
    }
  ];
  
  const navigation = [
    { name: 'Dashboard', icon: BarChart3, active: true },
    { name: 'Patients', icon: Users, active: false },
    { name: 'Clinical', icon: Heart, active: false },
    { name: 'Compliance', icon: Shield, active: false },
    { name: 'Settings', icon: Settings, active: false }
  ];

  return (
    <div className={`min-h-screen bg-black text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* NEURAL: Mesh Gradient Background */}
      <MeshGradientBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* NEURAL: BrainSAIT Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">BrainSAIT</h1>
                <p className="text-xs text-gray-300">LincCore™ Enterprise</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <motion.button
                  key={item.name}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl transition-all
                    ${item.active 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon size={16} />
                  <span className="text-sm">{item.name}</span>
                </motion.button>
              ))}
            </div>
            
            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              <LanguageToggle isRTL={isRTL} setIsRTL={setIsRTL} />
              
              <motion.button
                className="p-2 rounded-xl bg-white/10 border border-white/20 text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={18} />
              </motion.button>
              
              <motion.button
                className="p-2 rounded-xl bg-white/10 border border-white/20 text-white md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isRTL ? 'مرحباً بك في برين سايت' : 'Welcome to BrainSAIT'}
          </motion.h1>
          <motion.p 
            className="text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isRTL ? 'منصة الذكاء الاصطناعي للرعاية الصحية المتقدمة' : 'Advanced AI Healthcare Platform'}
          </motion.p>
        </div>
        
        {/* MEDICAL: Clinical Metrics */}
        <ClinicalMetrics />
        
        {/* AGENT: AI Agents Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {isRTL ? 'وكلاء الذكاء الاصطناعي' : 'AI Agents'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: agents.indexOf(agent) * 0.1 }}
              >
                <AgentCard 
                  agent={agent}
                  isActive={agent.status === 'active'}
                  metrics={agent.metrics}
                />
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* BRAINSAIT: System Status */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isRTL ? 'حالة النظام' : 'System Status'}
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">
                {isRTL ? 'يعمل بكفاءة' : 'All Systems Operational'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* HIPAA Compliance */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="text-green-400" size={24} />
              </div>
              <h3 className="font-bold text-white mb-1">HIPAA Compliant</h3>
              <p className="text-sm text-gray-300">
                {isRTL ? 'متوافق بنسبة ١٠٠٪' : '100% Compliant'}
              </p>
            </div>
            
            {/* NPHIES Integration */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="text-blue-400" size={24} />
              </div>
              <h3 className="font-bold text-white mb-1">NPHIES Ready</h3>
              <p className="text-sm text-gray-300">
                {isRTL ? 'متكامل مع المعايير السعودية' : 'Saudi Standards Integrated'}
              </p>
            </div>
            
            {/* Performance */}
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="text-teal-400" size={24} />
              </div>
              <h3 className="font-bold text-white mb-1">High Performance</h3>
              <p className="text-sm text-gray-300">
                {isRTL ? 'أداء عالي السرعة' : 'Sub-second Response'}
              </p>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default BrainSAITDashboard;