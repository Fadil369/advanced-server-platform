#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 3001
os.chdir('/app')

Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Frontend server running on port {PORT}")
    httpd.serve_forever()
