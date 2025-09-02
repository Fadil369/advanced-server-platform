// Content synchronization for brainsait.com
class ContentSync {
    constructor() {
        this.serverUrl = 'http://localhost:8000';
        this.sourceUrl = 'https://gp.thefadil.site';
    }

    async fetchContent(path = '') {
        try {
            const response = await fetch(`${this.serverUrl}/api/tools/fetch_content/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path })
            });
            return await response.json();
        } catch (error) {
            console.error('Content fetch failed:', error);
            return null;
        }
    }

    async loadSyncedContent() {
        try {
            const response = await fetch('/fetched-content.json');
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    async displayContent(containerId = 'content-container') {
        const content = await this.loadSyncedContent();
        if (content) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="synced-content">
                        <h2>${content.title}</h2>
                        <p class="source">Source: ${content.source}</p>
                        <div class="content">${content.content}</div>
                    </div>
                `;
            }
        }
    }
}

// Auto-initialize
window.contentSync = new ContentSync();
