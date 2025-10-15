import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  organizers: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
    permissions: {
      canEdit: boolean;
      canDelete: boolean;
      canManageTasks: boolean;
    };
  }>;
  participants: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    status: string;
    registeredAt: string;
  }>;
  maxParticipants: number;
  registrationDeadline?: string;
  image?: string;
  requirements: string[];
  tags: string[];
  status: string;
  isPublic: boolean;
  chatMessages: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    message: string;
    timestamp: string;
    isVote: boolean;
    votes: Array<{
      user: string;
      vote: string;
    }>;
  }>;
  analytics: {
    totalViews: number;
    totalRegistrations: number;
    attendanceRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  events: Event[];
  totalPages: number;
  currentPage: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(params?: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<EventListResponse> {
    return this.http.get<EventListResponse>(this.API_URL, { params: params as any });
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/${id}`);
  }

  createEvent(eventData: Partial<Event>): Observable<{ message: string; event: Event }> {
    return this.http.post<{ message: string; event: Event }>(this.API_URL, eventData);
  }

  updateEvent(id: string, eventData: Partial<Event>): Observable<{ message: string; event: Event }> {
    return this.http.put<{ message: string; event: Event }>(`${this.API_URL}/${id}`, eventData);
  }

  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  rsvpToEvent(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${id}/rsvp`, {});
  }

  cancelRsvp(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}/rsvp`);
  }

  addChatMessage(id: string, message: string, isVote: boolean = false): Observable<{ message: string; chatMessage: any }> {
    return this.http.post<{ message: string; chatMessage: any }>(`${this.API_URL}/${id}/chat`, {
      message,
      isVote
    });
  }

  voteOnMessage(eventId: string, messageId: string, vote: 'up' | 'down'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${eventId}/chat/${messageId}/vote`, { vote });
  }

  addOrganizer(eventId: string, userId: string, role: string, permissions: any): Observable<{ message: string; event: Event }> {
    return this.http.post<{ message: string; event: Event }>(`${this.API_URL}/${eventId}/organizers`, {
      userId,
      role,
      permissions
    });
  }
}