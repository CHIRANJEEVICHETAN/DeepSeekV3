export interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  mediaType?: 'image/png' | 'image/jpeg' | 'audio/mpeg';
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

export interface StoredChat extends Omit<Chat, 'lastUpdated'> {
  lastUpdated: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  notifications: boolean;
  soundEnabled: boolean;
}

export interface StoredData {
  chats: StoredChat[];
  settings: Settings;
  activeChat: string | null;
}