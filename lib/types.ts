export type ChatMessage = {
  message_id: string;
  session_id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
};

export type Session = {
  session_id: string;
  created_at: string;
  last_active_at: string;
  topic: string;
};

export type Feedback = {
  feedback_id: string;
  message_id: string;
  rating: 'up' | 'down';
  comment: string;
  timestamp: string;
};

export type TrainingRow = {
  id: string;
  question: string;
  answer: string;
  keywords: string;
};
