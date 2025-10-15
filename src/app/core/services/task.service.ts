import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  _id: string;
  title: string;
  description: string;
  event: {
    _id: string;
    title: string;
    date: string;
    venue: {
      name: string;
      address: string;
    };
  };
  assignedTo: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    assignedBy: {
      _id: string;
      name: string;
      email: string;
    };
    assignedAt: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    completedAt?: string;
    notes?: string;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  category: 'logistics' | 'outreach' | 'design' | 'technical' | 'coordination' | 'other';
  requirements: string[];
  attachments: Array<{
    filename: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  status: 'active' | 'completed' | 'cancelled';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:5000/api/tasks';

  constructor(private http: HttpClient) {}

  getTasksForEvent(eventId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/event/${eventId}`);
  }

  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/my-tasks`);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${id}`);
  }

  createTask(taskData: {
    eventId: string;
    title: string;
    description: string;
    assignedTo?: string[];
    priority?: string;
    dueDate?: string;
    category?: string;
    requirements?: string[];
    estimatedHours?: number;
  }): Observable<{ message: string; task: Task }> {
    return this.http.post<{ message: string; task: Task }>(this.API_URL, taskData);
  }

  updateTask(id: string, taskData: Partial<Task>): Observable<{ message: string; task: Task }> {
    return this.http.put<{ message: string; task: Task }>(`${this.API_URL}/${id}`, taskData);
  }

  assignTask(id: string, userId: string): Observable<{ message: string; task: Task }> {
    return this.http.post<{ message: string; task: Task }>(`${this.API_URL}/${id}/assign`, { userId });
  }

  updateTaskStatus(id: string, status: string, notes?: string): Observable<{ message: string; task: Task }> {
    return this.http.put<{ message: string; task: Task }>(`${this.API_URL}/${id}/status`, { status, notes });
  }

  uploadAttachment(id: string, filename: string, url: string): Observable<{ message: string; task: Task }> {
    return this.http.post<{ message: string; task: Task }>(`${this.API_URL}/${id}/attachments`, { filename, url });
  }

  deleteTask(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}