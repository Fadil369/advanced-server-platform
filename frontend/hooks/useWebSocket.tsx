'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface WebSocketContextType {
  isConnected: boolean;
  data: any;
  sendMessage: (message: any) => void;
  subscribe: (topic: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any>({});

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws/dashboard');
      
      ws.onopen = () => {
        setIsConnected(true);
        setSocket(ws);
        toast.success('Connected to real-time updates');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setData((prev: any) => ({ ...prev, ...message }));
          
          // Handle specific message types
          if (message.type === 'agent_execution_complete') {
            toast.success(`Agent ${message.agent_id} completed task`);
          } else if (message.type === 'agent_execution_error') {
            toast.error(`Agent ${message.agent_id} failed: ${message.error}`);
          } else if (message.type === 'new_alert') {
            const alert = message.alert;
            if (alert.type === 'critical') {
              toast.error(alert.title);
            } else if (alert.type === 'warning') {
              toast(alert.title, { icon: '⚠️' });
            } else {
              toast.success(alert.title);
            }
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setSocket(null);
        toast.error('Disconnected from real-time updates');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);

  const subscribe = useCallback((topic: string) => {
    sendMessage({ type: 'subscribe', topic });
  }, [sendMessage]);

  return (
    <WebSocketContext.Provider value={{ isConnected, data, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
