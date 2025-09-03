import { NextRequest, NextResponse } from 'next/server';

export interface Message {
  id: string;
  message: string;
  username: string;
  timestamp: number;
  isPrivate?: boolean;
  recipientId?: string;
  recipientUsername?: string;
}

export interface User {
  id: string;
  username: string;
  color: string;
}

// Función para generar colores aleatorios
const generateUserColor = (): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#9ca3af'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Almacenar mensajes y usuarios en memoria (se perderán al reiniciar)
const messages: Message[] = [];
let users: User[] = [];
const clients: { id: string; controller: ReadableStreamDefaultController; username?: string }[] = [];

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Math.random().toString(36).substring(7);
      clients.push({ id: clientId, controller });

      console.log(`Cliente conectado: ${clientId}, Total clientes: ${clients.length}, Usuarios: ${users.length}`);
      
      // Enviar mensajes existentes al nuevo cliente y el clientId
      controller.enqueue(`data: ${JSON.stringify({ type: 'initial', messages, users, clientId })}\n\n`);

      // Cleanup cuando se cierra la conexión
      const cleanup = () => {
        const clientIndex = clients.findIndex(c => c.id === clientId);
        if (clientIndex !== -1) {
          const client = clients[clientIndex];
          if (client.username) {
            // Encontrar usuario antes de removerlo
            const userToRemove = users.find(u => u.id === clientId);
            // Remover usuario de la lista
            users = users.filter(u => u.id !== clientId);
            // Notificar a otros clientes
            if (userToRemove) {
              broadcast({ type: 'user-left', user: userToRemove });
              // Enviar lista actualizada de usuarios
              broadcast({ type: 'users-update', users });
            }
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
      case 'private-message':
        handlePrivateMessage(data);
        break;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}

function handleJoin(username: string, clientId: string) {
  console.log(`Intento de join: ${username} con clientId: ${clientId}`);
  console.log(`Clientes actuales: ${clients.length}, Usuarios actuales: ${users.length}`);
  
  const client = clients.find(c => c.id === clientId);
  if (client) {
    console.log(`Cliente encontrado: ${clientId}`);
    
    // Verificar si el usuario ya existe (evitar duplicados)
    const existingUser = users.find(u => u.id === clientId);
    if (!existingUser) {
      client.username = username;
      const user = { id: clientId, username, color: generateUserColor() };
      users.push(user);
      
      console.log(`Usuario añadido: ${username}, Total usuarios ahora: ${users.length}`);
      
      // Notificar a todos los clientes sobre el nuevo usuario
      broadcast({ type: 'user-joined', user });
      
      // Enviar lista actualizada de usuarios a todos los clientes
      broadcast({ type: 'users-update', users });
      
      console.log(`Broadcast enviado para ${users.length} usuarios`);
    } else {
      console.log(`Usuario ${username} ya existe, no se añade de nuevo`);
    }
  } else {
    console.log(`Cliente NO encontrado: ${clientId}`);
    console.log(`Clientes disponibles: ${clients.map(c => c.id).join(', ')}`);
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

function handlePrivateMessage(data: { message: string; username: string; clientId: string; recipientId: string; recipientUsername: string }) {
  const message: Message = {
    id: Math.random().toString(36).substring(7),
    message: data.message,
    username: data.username,
    timestamp: Date.now(),
    isPrivate: true,
    recipientId: data.recipientId,
    recipientUsername: data.recipientUsername,
  };
  
  // Enviar mensaje solo al remitente y al destinatario
  const senderClient = clients.find(c => c.id === data.clientId);
  const recipientClient = clients.find(c => c.id === data.recipientId);
  
  const privateMessageData = { type: 'private-message', message };
  const messageStr = `data: ${JSON.stringify(privateMessageData)}\n\n`;
  
  if (senderClient) {
    try {
      senderClient.controller.enqueue(messageStr);
    } catch {
      // Cliente desconectado
    }
  }
  
  if (recipientClient) {
    try {
      recipientClient.controller.enqueue(messageStr);
    } catch {
      // Cliente desconectado
    }
  }
}

function broadcast(data: { type: string; message?: Message; user?: User; users?: User[] }) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.controller.enqueue(message);
    } catch {
      // Cliente desconectado, será limpiado en el próximo ping
    }
  });
} 