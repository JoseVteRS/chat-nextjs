import { NextRequest, NextResponse } from 'next/server';

export interface Message {
  id: string;
  message: string;
  username: string;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
}

// Almacenar mensajes y usuarios en memoria (se perderán al reiniciar)
let messages: Message[] = [];
let users: User[] = [];
let clients: { id: string; controller: ReadableStreamDefaultController; username?: string }[] = [];

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Math.random().toString(36).substring(7);
      clients.push({ id: clientId, controller });

      // Enviar mensajes existentes al nuevo cliente
      controller.enqueue(`data: ${JSON.stringify({ type: 'initial', messages, users })}\n\n`);

      // Cleanup cuando se cierra la conexión
      const cleanup = () => {
        const clientIndex = clients.findIndex(c => c.id === clientId);
        if (clientIndex !== -1) {
          const client = clients[clientIndex];
          if (client.username) {
            // Remover usuario de la lista
            users = users.filter(u => u.id !== clientId);
            // Notificar a otros clientes
            broadcast({ type: 'user-left', user: { id: clientId, username: client.username } });
          }
          clients.splice(clientIndex, 1);
        }
      };

      // Detectar cuando se cierra la conexión
      const timer = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
        } catch {
          cleanup();
          clearInterval(timer);
        }
      }, 30000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'join':
        handleJoin(data.username, data.clientId);
        break;
      case 'message':
        handleMessage(data);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}

function handleJoin(username: string, clientId: string) {
  const client = clients.find(c => c.id === clientId);
  if (client) {
    client.username = username;
    const user = { id: clientId, username };
    users.push(user);
    broadcast({ type: 'user-joined', user });
  }
}

function handleMessage(data: { message: string; username: string; clientId: string }) {
  const message: Message = {
    id: Math.random().toString(36).substring(7),
    message: data.message,
    username: data.username,
    timestamp: Date.now(),
  };
  
  messages.push(message);
  broadcast({ type: 'message', message });
}

function broadcast(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.controller.enqueue(message);
    } catch {
      // Cliente desconectado, será limpiado en el próximo ping
    }
  });
} 