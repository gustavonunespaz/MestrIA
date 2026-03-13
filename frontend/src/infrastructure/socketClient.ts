import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Componente Conectado ao Socket.io!');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado do Socket.io');
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event: string, fn: (...args: any[]) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on(event, fn);
  }

  off(event: string, fn?: (...args: any[]) => void) {
    this.socket?.off(event, fn);
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getStatus(): boolean {
    return this.isConnected;
  }
}

export const socketClient = new SocketClient();
