# BrainSait Website

**Advanced AI Server Platform Website with Integrated Dashboard**

A modern, responsive website for BrainSait's Advanced AI Server Platform, featuring real-time dashboard integration, live metrics, and seamless API connectivity.

## 🌟 Features

- **Modern Design**: Extracted and adapted from gp.thefadil.site with BrainSait branding
- **Live Dashboard Integration**: Real-time metrics from the Advanced Server Platform
- **Responsive Design**: Mobile-first approach with advanced responsive capabilities
- **Real-time Updates**: WebSocket integration for live data updates
- **API Integration**: Direct connection to platform APIs for live statistics
- **Performance Optimized**: Fast loading with minimal dependencies

## 🚀 Live URLs

- **Main Website**: https://brainsait.com
- **Platform Dashboard**: https://app.brainsait.com/dashboard
- **API Documentation**: https://docs.brainsait.com/docs
- **Grafana Monitoring**: https://grafana.brainsait.com
- **Prometheus Metrics**: https://prometheus.brainsait.com

## 🏗️ Architecture

```
BrainSait Website
├── public/
│   ├── index.html          # Main website with integrated dashboard
│   └── _redirects          # Cloudflare Pages redirects
├── wrangler.toml           # Cloudflare Pages configuration
├── package.json            # Project configuration
├── deploy.sh               # Deployment script
└── README.md               # This file
```

## 📊 Dashboard Integration

The website features live integration with the Advanced Server Platform:

### Real-time Metrics
- **System Status**: Live operational status
- **CPU Usage**: Real-time CPU utilization
- **Memory Usage**: Current memory consumption
- **Request Count**: Total API requests processed
- **Active Connections**: Current WebSocket connections
- **Agent Count**: Number of active AI agents
- **Tool Executions**: Tools executed count

### API Endpoints Used
- `GET /api/status` - System status and metrics
- `GET /api/metrics` - Detailed performance metrics
- `GET /api/agents` - AI agent information
- `WebSocket /ws` - Real-time updates

## 🎨 Design System

### Color Palette
- **Primary Black**: `#0A0A0B`
- **Navy Secondary**: `#0F172A`
- **Navy Dark**: `#0C1222`
- **Blue Accent**: `#3B82F6`
- **Blue Light**: `#60A5FA`
- **Green Accent**: `#10B981`
- **White**: `#FFFFFF`
- **Gray Light**: `#E5E7EB`

### Typography
- **Primary Font**: Inter (System fonts fallback)
- **Display Font**: Playfair Display (for headings)
- **Font Features**: OpenType features enabled
- **Smoothing**: Antialiased rendering

### Components
- **Navigation**: Fixed header with smooth scrolling
- **Hero Section**: Gradient background with animated elements
- **Feature Cards**: Interactive cards with hover effects
- **Dashboard Preview**: Live metrics integration
- **Responsive Grid**: Mobile-first responsive layout

## 🚀 Deployment

### Cloudflare Pages Deployment

1. **Automatic Deployment** (Recommended):
   ```bash
   ./deploy.sh
   ```

2. **Manual Deployment**:
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler
   
   # Deploy to Cloudflare Pages
   wrangler pages deploy public --project-name brainsait-website
   ```

3. **GitHub Integration**:
   - Connect repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set output directory: `public`
   - Configure custom domain: `brainsait.com`

### Environment Setup

1. **Prerequisites**:
   - Node.js 18+ (for Wrangler CLI)
   - Git configured
   - Cloudflare account with Pages access

2. **Configuration**:
   - Update `wrangler.toml` with your account details
   - Configure DNS to point to Cloudflare Pages
   - Set up custom domain in Cloudflare Dashboard

## 🔧 Development

### Local Development
```bash
# Serve locally (simple HTTP server)
python3 -m http.server 8080 --directory public

# Or use any static file server
npx serve public
```

### File Structure
- `public/index.html` - Main website file (self-contained)
- `public/_redirects` - Cloudflare Pages redirect rules
- `wrangler.toml` - Cloudflare configuration
- `deploy.sh` - Automated deployment script

### Customization
- **Branding**: Update logo and colors in CSS variables
- **Content**: Modify sections in `index.html`
- **API Integration**: Update API endpoints in JavaScript
- **Styling**: Modify CSS custom properties

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1025px - 1400px
- **Large Desktop**: > 1400px

### Features
- Mobile-first CSS approach
- Touch-friendly interactions
- Optimized typography scaling
- Flexible grid layouts
- Responsive navigation

## 🔌 API Integration

### Live Data Sources
```javascript
// System status
fetch('https://app.brainsait.com/api/status')

// Performance metrics
fetch('https://app.brainsait.com/api/metrics')

// WebSocket connection
new WebSocket('wss://app.brainsait.com/ws')
```

### Fallback Handling
- Graceful degradation when APIs are unavailable
- Demo data display for offline scenarios
- Error handling with user-friendly messages

## 🛡️ Security

### Features
- **HTTPS Only**: All connections encrypted
- **CORS Handling**: Proper cross-origin configuration
- **Content Security**: No inline scripts (where possible)
- **Privacy**: No tracking or analytics

### Best Practices
- Secure API communication
- Input validation
- XSS prevention
- CSRF protection

## 📈 Performance

### Optimization
- **Minimal Dependencies**: Only essential libraries
- **Optimized Images**: Responsive image loading
- **CSS Optimization**: Efficient selectors and properties
- **JavaScript**: Async loading and minimal DOM manipulation

### Metrics
- **Load Time**: < 2 seconds
- **First Paint**: < 1 second
- **Interactive**: < 3 seconds
- **Lighthouse Score**: 90+

## 🔄 Updates

### Automated Updates
- Real-time metrics refresh every 30 seconds
- WebSocket updates for instant notifications
- Automatic fallback to polling if WebSocket fails

### Manual Updates
- Content updates via Git commits
- Automatic deployment on push to main branch
- Cloudflare Pages handles build and deployment

## 📞 Support

### Resources
- **Platform Dashboard**: https://app.brainsait.com/dashboard
- **API Documentation**: https://docs.brainsait.com/docs
- **System Status**: https://app.brainsait.com/health
- **GitHub Repository**: https://github.com/Fadil369/brainsait-website

### Contact
- **Technical Issues**: Check platform dashboard
- **Feature Requests**: Create GitHub issue
- **General Inquiries**: Through platform contact form

---

**Built with ❤️ for the next generation of AI-powered infrastructure**

*Last updated: September 2, 2025*
