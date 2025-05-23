// Based on OpenAPI schema

export interface HandoffRequest {
  external_session_id: string;
  question_text: string;
  answer_type: string;
  persona: string;
  possible_answers?: string[] | null;
}

export interface ResponseRequest {
  session_question_id: number;
  response: string;
}

export interface UserCreate {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  persona?: string | null;
}

export interface UserOut extends UserCreate {
  id: number;
}

export interface ChannelCreate {
  name: string;
  type: string;
  config?: Record<string, any> | null;
}

export interface ChannelOut extends ChannelCreate {
  id: number;
}

export interface UserChannelCreate {
  user_id: number;
  channel_id: number;
  contact_details: Record<string, any>;
  is_preferred?: boolean | null;
}

export interface UserChannelOut extends UserChannelCreate {
  id: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}
