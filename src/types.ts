export interface Participant {
  id: string;
  name: string;
  role: "Kağan" | "Yazıcı" | "Alp" | "Toy Üyesi";
  avatar: string;
  isCamOn: boolean;
  isMicOn: boolean;
  simulatedNoise: "Low" | "Medium" | "High";
  streamVolume: number; // 0 to 100 for audio visualization
  isMutedByAdmin: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
  isApproved: boolean; // For Waiting Room
  badge: "Altın" | "Gümüş" | "Kutlu" | "";
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isPinned: boolean;
  attachments?: Array<{
    name: string;
    type: "image" | "video" | "audio" | "document";
    size: string;
    url?: string;
  }>;
  emojiReactions?: Array<{
    char: string;
    count: number;
    users: string[];
  }>;
  translation?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  isActive: boolean;
  totalVotes: number;
  votedOptionId?: string;
}

export interface WhiteboardElement {
  id: string;
  type: "rect" | "circle" | "line" | "free" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Array<{ x: number; y: number }>;
  color: string;
  text?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  category: "Güvenlik" | "Bağlantı" | "Sistem" | "Yapay Zeka";
  severity: "info" | "warning" | "success" | "danger";
  message: string;
}
