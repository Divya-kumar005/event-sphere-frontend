import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  timestamp: string;
  isVote: boolean;
  voteOptions?: string[];
  votes: Array<{
    user: string;
    vote: string;
    voteOption?: string;
    votedAt?: string;
  }>;
}

export interface VotingResults {
  [option: string]: {
    count: number;
    voters: Array<{
      user: {
        _id: string;
        name: string;
        email: string;
      };
      votedAt: string;
    }>;
  };
}

export interface CollaborationSummary {
  totalMessages: number;
  votingMessages: number;
  totalVotes: number;
  organizerActivity: Array<{
    organizer: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
    messageCount: number;
    voteCount: number;
    lastActivity: number | null;
  }>;
  recentMessages: ChatMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class OrganizerChatService {
  private readonly API_URL = 'http://localhost:5000/api/organizer-chat';

  constructor(private http: HttpClient) {}

  getChatMessages(eventId: string): Observable<{ messages: ChatMessage[]; organizers: any[] }> {
    return this.http.get<{ messages: ChatMessage[]; organizers: any[] }>(`${this.API_URL}/event/${eventId}/chat`);
  }

  addMessage(eventId: string, message: string, isVote: boolean = false, voteOptions?: string[]): Observable<{ message: string; chatMessage: ChatMessage }> {
    return this.http.post<{ message: string; chatMessage: ChatMessage }>(`${this.API_URL}/event/${eventId}/chat`, {
      message,
      isVote,
      voteOptions
    });
  }

  voteOnMessage(eventId: string, messageId: string, vote: string, voteOption?: string): Observable<{ message: string; chatMessage: ChatMessage }> {
    return this.http.post<{ message: string; chatMessage: ChatMessage }>(`${this.API_URL}/event/${eventId}/chat/${messageId}/vote`, {
      vote,
      voteOption
    });
  }

  getVotingResults(eventId: string, messageId: string): Observable<{ message: string; results: VotingResults; totalVotes: number; totalOrganizers: number }> {
    return this.http.get<{ message: string; results: VotingResults; totalVotes: number; totalOrganizers: number }>(`${this.API_URL}/event/${eventId}/chat/${messageId}/results`);
  }

  deleteMessage(eventId: string, messageId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/event/${eventId}/chat/${messageId}`);
  }

  getCollaborationSummary(eventId: string): Observable<{ message: string; summary: CollaborationSummary }> {
    return this.http.get<{ message: string; summary: CollaborationSummary }>(`${this.API_URL}/event/${eventId}/collaboration-summary`);
  }
}
