import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  event?: {
    _id: string;
    title: string;
    date: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'general' | 'event_update' | 'reminder' | 'cancellation' | 'important';
  targetAudience: 'all' | 'organizers' | 'participants' | 'specific_event';
  isVisible: boolean;
  attachments: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  reactions: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    reaction: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
    createdAt: string;
  }>;
  comments: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    content: string;
    createdAt: string;
    isEdited: boolean;
    editedAt?: string;
  }>;
  scheduledFor?: string;
  isScheduled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  totalPages: number;
  currentPage: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private readonly API_URL = `${environment.apiUrl}/announcements`;

  constructor(private http: HttpClient) {}

  getAnnouncements(params?: {
    eventId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Observable<AnnouncementListResponse> {
    return this.http.get<AnnouncementListResponse>(this.API_URL, { params: params as any });
  }

  getAnnouncement(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.API_URL}/${id}`);
  }

  createAnnouncement(announcementData: {
    title: string;
    content: string;
    eventId?: string;
    priority?: string;
    type?: string;
    targetAudience?: string;
    scheduledFor?: string;
  }): Observable<{ message: string; announcement: Announcement }> {
    return this.http.post<{ message: string; announcement: Announcement }>(this.API_URL, announcementData);
  }

  updateAnnouncement(id: string, announcementData: Partial<Announcement>): Observable<{ message: string; announcement: Announcement }> {
    return this.http.put<{ message: string; announcement: Announcement }>(`${this.API_URL}/${id}`, announcementData);
  }

  deleteAnnouncement(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  addComment(id: string, content: string): Observable<{ message: string; announcement: Announcement }> {
    return this.http.post<{ message: string; announcement: Announcement }>(`${this.API_URL}/${id}/comments`, { content });
  }

  addReaction(id: string, reaction: string): Observable<{ message: string; announcement: Announcement }> {
    return this.http.post<{ message: string; announcement: Announcement }>(`${this.API_URL}/${id}/reactions`, { reaction });
  }

  markAsRead(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${id}/read`, {});
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.API_URL}/unread/count`);
  }
}