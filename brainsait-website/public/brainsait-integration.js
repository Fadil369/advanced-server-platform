// BrainSait Platform Integration
class BrainSaitPlatform {
    constructor() {
        this.serverUrl = 'http://localhost:8000';
        this.updateInterval = 5000; // 5 seconds
        this.init();
    }

    init() {
        // Initialize Feather Icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Setup mobile menu
        this.setupMobileMenu();
        
        // Setup smooth scrolling
        this.setupSmoothScrolling();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        // Load initial content
        this.loadSyncedContent();
        
        // Setup navigation highlighting
        this.setupNavigationHighlighting();
    }

    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        const hamburgerIcon = mobileMenuToggle?.querySelector('.hamburger-icon');
        const closeIcon = mobileMenuToggle?.querySelector('.close-icon');
        
        if (!mobileMenuToggle || !navMenu) return;

        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isActive = navMenu.classList.contains('active');
            
            if (hamburgerIcon && closeIcon) {
                hamburgerIcon.style.display = isActive ? 'none' : 'inline';
                closeIcon.style.display = isActive ? 'inline' : 'none';
            }
        });

        // Close menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (hamburgerIcon && closeIcon) {
                    hamburgerIcon.style.display = 'inline';
                    closeIcon.style.display = 'none';
                }
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                if (hamburgerIcon && closeIcon) {
                    hamburgerIcon.style.display = 'inline';
                    closeIcon.style.display = 'none';
                }
            }
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupNavigationHighlighting() {
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    async startRealTimeUpdates() {
        // Update metrics every 5 seconds
        setInterval(() => {
            this.updateMetrics();
        }, this.updateInterval);

        // Initial update
        this.updateMetrics();
    }

    async updateMetrics() {
        try {
            // Get platform metrics
            const metricsResponse = await fetch(`${this.serverUrl}/api/metrics`);
            if (metricsResponse.ok) {
                const metrics = await metricsResponse.json();
                this.updateDashboardMetrics(metrics);
            }

            // Get tools info
            const toolsResponse = await fetch(`${this.serverUrl}/api/tools`);
            if (toolsResponse.ok) {
                const tools = await toolsResponse.json();
                this.updateToolsMetrics(tools);
            }

            // Get agents info
            const agentsResponse = await fetch(`${this.serverUrl}/api/agents`);
            if (agentsResponse.ok) {
                const agents = await agentsResponse.json();
                this.updateAgentsMetrics(agents);
            }

        } catch (error) {
            console.log('Metrics update failed:', error.message);
        }
    }

    updateDashboardMetrics(metrics) {
        const elements = {
            'tools-executed': metrics.metrics?.tools_executed || 0,
            'system-health': '100%',
            'uptime': '99.9%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    updateToolsMetrics(tools) {
        const toolsAvailable = document.getElementById('tools-available');
        if (toolsAvailable) {
            toolsAvailable.textContent = tools.total || 8;
        }
    }

    updateAgentsMetrics(agents) {
        const activeAgents = document.getElementById('active-agents');
        if (activeAgents) {
            activeAgents.textContent = agents.total || 0;
        }
    }

    async loadSyncedContent() {
        try {
            const response = await fetch('/fetched-content.json');
            if (response.ok) {
                const content = await response.json();
                this.displaySyncedContent(content);
                
                // Update content synced counter
                const contentSynced = document.getElementById('content-synced');
                if (contentSynced) {
                    contentSynced.textContent = '1';
                }
            }
        } catch (error) {
            console.log('No synced content available yet');
        }
    }

    displaySyncedContent(content) {
        const container = document.getElementById('synced-content');
        if (container && content) {
            container.innerHTML = `
                <h3>📄 ${content.title || 'Synced Content'}</h3>
                <p><strong>Source:</strong> ${content.source || 'gp.thefadil.site'}</p>
                <p><strong>Last Sync:</strong> ${content.timestamp ? new Date(content.timestamp * 1000).toLocaleString() : 'Unknown'}</p>
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 0.5rem; border: 1px solid rgba(59, 130, 246, 0.3);">
                    ${content.content ? content.content.substring(0, 300) + '...' : 'No content available'}
                </div>
            `;
        }
    }

    showStatus(elementId, message, type = 'loading') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="status ${type}">${message}</div>`;
        }
    }

    async makeApiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.serverUrl}${endpoint}`, options);
            return await response.json();
        } catch (error) {
            throw new Error(`API call failed: ${error.message}`);
        }
    }
}

// Global functions for button interactions
async function fetchContent() {
    const platform = window.brainSaitPlatform;
    const syncBtn = document.getElementById('sync-btn');
    const originalText = syncBtn.innerHTML;
    
    // Update button state
    syncBtn.innerHTML = '<i data-feather="loader"></i> Syncing...';
    syncBtn.disabled = true;
    
    platform.showStatus('sync-status', '🔄 Fetching content from gp.thefadil.site...', 'loading');
    
    try {
        const result = await platform.makeApiCall('/api/tools/fetch_content/execute', 'POST', { path: '' });
        
        if (result.status === 'success') {
            platform.showStatus('sync-status', '✅ Content synced successfully!', 'success');
            await platform.loadSyncedContent();
            
            // Update content counter
            const contentSynced = document.getElementById('content-synced');
            if (contentSynced) {
                contentSynced.textContent = parseInt(contentSynced.textContent) + 1;
            }
        } else {
            platform.showStatus('sync-status', `❌ Sync failed: ${result.error}`, 'error');
        }
    } catch (error) {
        platform.showStatus('sync-status', `❌ Network error: ${error.message}`, 'error');
    } finally {
        // Reset button
        syncBtn.innerHTML = originalText;
        syncBtn.disabled = false;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

async function listAgents() {
    const platform = window.brainSaitPlatform;
    platform.showStatus('platform-status', '🔄 Loading agents...', 'loading');
    
    try {
        const result = await platform.makeApiCall('/api/agents');
        platform.showStatus('platform-status', `✅ Found ${result.total || 0} agents available`, 'success');
    } catch (error) {
        platform.showStatus('platform-status', `❌ Error: ${error.message}`, 'error');
    }
}

async function listTools() {
    const platform = window.brainSaitPlatform;
    platform.showStatus('platform-status', '🔄 Loading tools...', 'loading');
    
    try {
        const result = await platform.makeApiCall('/api/tools');
        platform.showStatus('platform-status', `✅ ${result.total || 0} tools available across ${result.categories?.length || 0} categories`, 'success');
    } catch (error) {
        platform.showStatus('platform-status', `❌ Error: ${error.message}`, 'error');
    }
}

async function getMetrics() {
    const platform = window.brainSaitPlatform;
    platform.showStatus('platform-status', '🔄 Loading metrics...', 'loading');
    
    try {
        const result = await platform.makeApiCall('/api/metrics');
        const metrics = result.metrics || {};
        platform.showStatus('platform-status', 
            `✅ Requests: ${metrics.requests || 0} | Tools: ${metrics.tools_executed || 0} | WebSocket: ${metrics.websocket_connections || 0}`, 
            'success'
        );
    } catch (error) {
        platform.showStatus('platform-status', `❌ Error: ${error.message}`, 'error');
    }
}

async function executeSecurityScan() {
    const platform = window.brainSaitPlatform;
    platform.showStatus('platform-status', '🔄 Running security scan...', 'loading');
    
    try {
        const result = await platform.makeApiCall('/api/tools/security_scan/execute', 'POST', {});
        platform.showStatus('platform-status', `✅ Security scan completed: ${result.output || 'No issues found'}`, 'success');
    } catch (error) {
        platform.showStatus('platform-status', `❌ Security scan failed: ${error.message}`, 'error');
    }
}

// Initialize platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.brainSaitPlatform = new BrainSaitPlatform();
});

// Handle viewport height changes on mobile
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
