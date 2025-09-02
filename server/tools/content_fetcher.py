import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import json

class ContentFetcher:
    def __init__(self):
        self.base_url = "https://gp.thefadil.site"
        
    async def fetch_content(self, path: str = "") -> Dict:
        """Fetch content from gp.thefadil.site"""
        url = f"{self.base_url}/{path}".rstrip('/')
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        return {
                            "url": url,
                            "title": soup.title.string if soup.title else "",
                            "content": soup.get_text(strip=True),
                            "html": content,
                            "status": "success"
                        }
                    else:
                        return {"status": "error", "code": response.status}
            except Exception as e:
                return {"status": "error", "message": str(e)}
    
    async def sync_to_brainsait(self, content: Dict) -> bool:
        """Sync fetched content to brainsait structure"""
        if content.get("status") != "success":
            return False
            
        # Create brainsait-compatible content
        brainsait_content = {
            "title": content["title"],
            "content": content["content"],
            "source": content["url"],
            "timestamp": asyncio.get_event_loop().time()
        }
        
        # Save to brainsait website
        with open("/home/ubuntu/brainsait-website/public/fetched-content.json", "w") as f:
            json.dump(brainsait_content, f, indent=2)
            
        return True

# Tool registration for MCP
async def fetch_and_sync_content(path: str = "") -> Dict:
    """MCP tool to fetch content from gp.thefadil.site and sync to brainsait"""
    fetcher = ContentFetcher()
    content = await fetcher.fetch_content(path)
    
    if content.get("status") == "success":
        await fetcher.sync_to_brainsait(content)
        
    return content
