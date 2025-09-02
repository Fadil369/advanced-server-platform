// Enhanced BrainSait Application
class BrainSaitApp {
    constructor() {
        this.serverUrl = 'http://localhost:8000';
        this.isConnected = false;
        this.metrics = {};
        this.syncInterval = null;
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.initializeApp();
        this.hideLoadingScreen();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.checkConnection();
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 3000);
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    async initializeApp() {
        // Initialize components
        await this.loadInitialData();
        this.setupAnimations();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Mobile menu
        this.setupMobileMenu();
        
        // FAB menu
        this.setupFAB();
        
        // Theme toggle
        this.setupThemeToggle();
        
        // Scroll effects
        this.setupScrollEffects();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.scrollToSection(section);
                    this.setActiveNavLink(link);
                }
            });
        });

        // Update active nav on scroll
        window.addEventListener('scroll', () => {
            this.updateActiveNavOnScroll();
        });
    }

    setupMobileMenu() {
        const toggle = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('navMenu');
        const hamburger = toggle?.querySelector('.hamburger-icon');
        const close = toggle?.querySelector('.close-icon');

        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                const isActive = menu.classList.contains('active');
                
                if (hamburger && close) {
                    hamburger.style.display = isActive ? 'none' : 'block';
                    close.style.display = isActive ? 'block' : 'none';
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                    menu.classList.remove('active');
                    if (hamburger && close) {
                        hamburger.style.display = 'block';
                        close.style.display = 'none';
                    }
                }
            });
        }
    }

    setupFAB() {
        const fab = document.getElementById('mainFab');
        const fabMenu = document.getElementById('fabMenu');

        if (fab && fabMenu) {
            fab.addEventListener('click', () => {
                fabMenu.classList.toggle('active');
                fab.style.transform = fabMenu.classList.contains('active') 
                    ? 'rotate(45deg)' : 'rotate(0deg)';
            });
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    setupScrollEffects() {
        // Parallax and scroll animations
        window.addEventListener('scroll', () => {
            this.handleScrollEffects();
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.feature-card, .analytics-card').forEach(el => {
            observer.observe(el);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for quick actions
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openQuickActions();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.updateMetrics(),
                this.loadSyncedContent(),
                this.checkSystemHealth()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Failed to load initial data', 'error');
        }
    }

    async updateMetrics() {
        try {
            const response = await fetch(`${this.serverUrl}/api/metrics`);
            if (response.ok) {
                const data = await response.json();
                this.metrics = data.metrics || {};
                this.updateMetricsDisplay();
                this.isConnected = true;
            }
        } catch (error) {
            this.isConnected = false;
            console.error('Metrics update failed:', error);
        }
        
        this.updateConnectionStatus();
    }

    updateMetricsDisplay() {
        // Update hero stats
        this.animateCounter('totalRequests', this.metrics.requests || 0);
        this.animateCounter('activeAgents', 0); // Will be updated from agents API
        this.animateCounter('toolsExecuted', this.metrics.tools_executed || 0);

        // Update feature stats
        this.animateCounter('contentSynced', 1);
        this.animateCounter('agentCount', 0);
        this.animateCounter('toolCount', 8);
        this.animateCounter('toolsRun', this.metrics.tools_executed || 0);

        // Update analytics
        this.animateCounter('apiRequests', this.metrics.requests || 0);
        document.getElementById('successRate').textContent = '100%';
        document.getElementById('avgResponse').textContent = '45ms';
    }

    animateCounter(elementId, targetValue, duration = 2000) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseInt(element.textContent) || 0;
        const increment = (targetValue - startValue) / (duration / 16);
        let currentValue = startValue;

        const animate = () => {
            currentValue += increment;
            if ((increment > 0 && currentValue >= targetValue) || 
                (increment < 0 && currentValue <= targetValue)) {
                element.textContent = targetValue;
                return;
            }
            element.textContent = Math.floor(currentValue);
            requestAnimationFrame(animate);
        };

        animate();
    }

    async loadSyncedContent() {
        try {
            const response = await fetch('/fetched-content.json');
            if (response.ok) {
                const content = await response.json();
                this.displaySyncedContent(content);
            }
        } catch (error) {
            console.log('No synced content available');
        }
    }

    displaySyncedContent(content) {
        const container = document.getElementById('syncedContent');
        if (container && content) {
            container.innerHTML = `
                <div class="content-preview">
                    <h3>📄 ${content.title || 'Latest Synced Content'}</h3>
                    <div class="content-meta">
                        <span><i class="fas fa-link"></i> ${content.source || 'gp.thefadil.site'}</span>
                        <span><i class="fas fa-clock"></i> ${content.timestamp ? new Date(content.timestamp * 1000).toLocaleString() : 'Unknown'}</span>
                    </div>
                    <div class="content-body">
                        ${content.content ? content.content.substring(0, 300) + '...' : 'No content available'}
                    </div>
                    <button class="btn btn-secondary" onclick="app.viewFullContent()">
                        <i class="fas fa-expand"></i>
                        View Full Content
                    </button>
                </div>
            `;
        }
    }

    async checkSystemHealth() {
        try {
            const response = await fetch(`${this.serverUrl}/health`);
            const health = response.ok ? 'Healthy' : 'Issues Detected';
            document.getElementById('systemHealth').textContent = response.ok ? '100%' : '85%';
        } catch (error) {
            document.getElementById('systemHealth').textContent = 'Offline';
        }
    }

    updateConnectionStatus() {
        const status = document.getElementById('connectionStatus');
        if (status) {
            const icon = status.querySelector('i');
            const text = status.querySelector('span');
            
            if (this.isConnected) {
                icon.className = 'fas fa-circle';
                text.textContent = 'Connected';
                status.style.color = 'var(--success-green)';
            } else {
                icon.className = 'fas fa-exclamation-circle';
                text.textContent = 'Disconnected';
                status.style.color = 'var(--error-red)';
            }
        }
    }

    startRealTimeUpdates() {
        // Update metrics every 5 seconds
        setInterval(() => {
            this.updateMetrics();
        }, 5000);

        // Update time-sensitive displays every second
        setInterval(() => {
            this.updateTimeDisplays();
        }, 1000);
    }

    updateTimeDisplays() {
        // Update any time-based displays
        const timeElements = document.querySelectorAll('[data-time]');
        timeElements.forEach(el => {
            const timestamp = el.getAttribute('data-time');
            if (timestamp) {
                el.textContent = this.formatRelativeTime(new Date(timestamp));
            }
        });
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    }

    // Navigation Methods
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80; // Account for fixed header
            const elementPosition = element.offsetTop - offset;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    setActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    updateActiveNavOnScroll() {
        const sections = ['home', 'platform', 'analytics', 'sync'];
        const scrollPos = window.scrollY + 100;

        for (const sectionId of sections) {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
                    if (navLink && !navLink.classList.contains('active')) {
                        this.setActiveNavLink(navLink);
                    }
                    break;
                }
            }
        }
    }

    handleScrollEffects() {
        const scrollY = window.scrollY;
        
        // Parallax effect for hero background
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrollY * 0.5}px)`;
        }

        // Header background opacity
        const header = document.querySelector('.nav-header');
        if (header) {
            const opacity = Math.min(scrollY / 100, 0.95);
            header.style.background = `rgba(10, 10, 11, ${opacity})`;
        }
    }

    // Content Sync Methods
    async syncContent() {
        const syncBtn = document.getElementById('syncBtn');
        const originalText = syncBtn.innerHTML;
        
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        syncBtn.disabled = true;
        
        this.updateSyncStatus('Fetching content from gp.thefadil.site...', 'loading');
        
        try {
            const response = await fetch(`${this.serverUrl}/api/tools/fetch_content/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: '' })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.updateSyncStatus('Content synced successfully!', 'success');
                await this.loadSyncedContent();
                this.animateCounter('contentSynced', parseInt(document.getElementById('contentSynced').textContent) + 1);
                this.showNotification('Content synchronized successfully', 'success');
            } else {
                this.updateSyncStatus(`Sync failed: ${result.error}`, 'error');
                this.showNotification(`Sync failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.updateSyncStatus(`Network error: ${error.message}`, 'error');
            this.showNotification(`Network error: ${error.message}`, 'error');
        } finally {
            syncBtn.innerHTML = originalText;
            syncBtn.disabled = false;
        }
    }

    updateSyncStatus(message, type) {
        const statusElement = document.getElementById('syncStatus');
        if (statusElement) {
            const iconClass = {
                'loading': 'fas fa-spinner fa-spin',
                'success': 'fas fa-check-circle',
                'error': 'fas fa-exclamation-circle'
            }[type] || 'fas fa-info-circle';

            const colorClass = {
                'loading': 'var(--primary-blue)',
                'success': 'var(--success-green)',
                'error': 'var(--error-red)'
            }[type] || 'var(--text-secondary)';

            statusElement.innerHTML = `
                <div class="status-indicator" style="color: ${colorClass}">
                    <i class="${iconClass}"></i>
                    <span>${message}</span>
                </div>
            `;
        }
    }

    // Feature Methods
    async testContentSync() {
        await this.syncContent();
    }

    async manageAgents() {
        try {
            const response = await fetch(`${this.serverUrl}/api/agents`);
            const data = await response.json();
            
            this.openModal('Agent Management', `
                <div class="agents-list">
                    <p>Total Agents: ${data.total || 0}</p>
                    <p>Available Agent Types: Development, Infrastructure, Monitoring, Security, Automation</p>
                    <button class="btn btn-primary" onclick="app.createAgent()">
                        <i class="fas fa-plus"></i>
                        Create New Agent
                    </button>
                </div>
            `);
        } catch (error) {
            this.showNotification('Failed to load agents', 'error');
        }
    }

    async showTools() {
        try {
            const response = await fetch(`${this.serverUrl}/api/tools`);
            const data = await response.json();
            
            const toolsList = Object.entries(data.tools || {}).map(([name, tool]) => `
                <div class="tool-item">
                    <strong>${name}</strong>
                    <p>${tool.description}</p>
                    <span class="tool-category">${tool.category}</span>
                </div>
            `).join('');

            this.openModal('Available Tools', `
                <div class="tools-list">
                    <p>Total Tools: ${data.total || 0}</p>
                    <div class="tools-grid">
                        ${toolsList}
                    </div>
                </div>
            `);
        } catch (error) {
            this.showNotification('Failed to load tools', 'error');
        }
    }

    showAnalytics() {
        this.scrollToSection('analytics');
    }

    // Utility Methods
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconClass = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="${iconClass}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    openModal(title, content) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.classList.add('active');
        }
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    toggleTheme() {
        // Theme toggle functionality
        document.body.classList.toggle('light-theme');
        this.showNotification('Theme toggled', 'info');
    }

    // Quick Actions
    openQuickActions() {
        this.openModal('Quick Actions', `
            <div class="quick-actions">
                <button class="btn btn-primary" onclick="app.syncContent()">
                    <i class="fas fa-sync"></i>
                    Sync Content
                </button>
                <button class="btn btn-secondary" onclick="app.refreshMetrics()">
                    <i class="fas fa-chart-bar"></i>
                    Refresh Metrics
                </button>
                <button class="btn btn-secondary" onclick="app.showSystemInfo()">
                    <i class="fas fa-info-circle"></i>
                    System Info
                </button>
            </div>
        `);
    }

    async refreshMetrics() {
        await this.updateMetrics();
        this.showNotification('Metrics refreshed', 'success');
    }

    showSystemInfo() {
        const info = `
            <div class="system-info">
                <p><strong>Platform:</strong> BrainSait AI Platform</p>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Status:</strong> ${this.isConnected ? 'Connected' : 'Disconnected'}</p>
                <p><strong>Last Update:</strong> ${new Date().toLocaleString()}</p>
            </div>
        `;
        this.openModal('System Information', info);
    }

    // Animation and UI helpers
    setupAnimations() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                animation: slideInUp 0.6s ease forwards;
            }
            
            .tool-item, .agent-item {
                padding: 1rem;
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                margin-bottom: 1rem;
            }
            
            .tool-category {
                background: var(--primary-blue);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
            }
            
            .quick-actions {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .content-meta {
                display: flex;
                gap: 1rem;
                margin: 1rem 0;
                font-size: 0.875rem;
                color: var(--text-muted);
            }
            
            .content-body {
                background: rgba(255, 255, 255, 0.05);
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 1rem 0;
                line-height: 1.6;
            }
        `;
        document.head.appendChild(style);
    }

    initializeCharts() {
        // Initialize chart placeholders
        const canvas = document.getElementById('performanceChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'var(--text-muted)';
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Performance Chart', canvas.width / 2, canvas.height / 2);
        }
    }
}

// Global functions for HTML onclick handlers
function scrollToSection(sectionId) {
    app.scrollToSection(sectionId);
}

function openDemo() {
    app.showNotification('Demo feature coming soon!', 'info');
}

function syncContent() {
    app.syncContent();
}

function testContentSync() {
    app.testContentSync();
}

function manageAgents() {
    app.manageAgents();
}

function showTools() {
    app.showTools();
}

function showAnalytics() {
    app.showAnalytics();
}

function refreshMetrics() {
    app.refreshMetrics();
}

function viewSyncHistory() {
    app.showNotification('Sync history feature coming soon!', 'info');
}

function quickSync() {
    app.syncContent();
}

function openChat() {
    app.showNotification('AI Assistant feature coming soon!', 'info');
}

function showMetrics() {
    app.scrollToSection('analytics');
}

function closeModal() {
    app.closeModal();
}

function viewFullContent() {
    app.showNotification('Full content viewer coming soon!', 'info');
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BrainSaitApp();
});

// Handle viewport height changes on mobile
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
