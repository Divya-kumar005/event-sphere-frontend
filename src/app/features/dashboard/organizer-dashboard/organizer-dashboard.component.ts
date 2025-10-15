import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, Event } from '../../../core/services/event.service';
import { TaskService, Task } from '../../../core/services/task.service';
import { AnnouncementService, Announcement } from '../../../core/services/announcement.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './organizer-dashboard.component.html',
  styleUrls: ['./organizer-dashboard.component.css']
})
export class OrganizerDashboardComponent implements OnInit {
  myEvents: Event[] = [];
  recentTasks: Task[] = [];
  recentAnnouncements: Announcement[] = [];
  isLoading = true;
  stats = {
    totalEvents: 0,
    totalParticipants: 0,
    pendingTasks: 0,
    upcomingEvents: 0
  };

  currentUser: any = null;

  constructor(
    private eventService: EventService,
    private taskService: TaskService,
    private announcementService: AnnouncementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load events
    this.eventService.getEvents({ limit: 10 }).subscribe({
      next: (response) => {
        this.myEvents = response.events;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      }
    });

    // Load tasks
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.recentTasks = tasks.slice(0, 5);
        this.stats.pendingTasks = tasks.filter(task => 
          task.assignedTo.some(assignment => 
            assignment.user._id === this.currentUser?._id && 
            assignment.status === 'pending'
          )
        ).length;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });

    // Load announcements
    this.announcementService.getAnnouncements({ limit: 5 }).subscribe({
      next: (response) => {
        this.recentAnnouncements = response.announcements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.totalEvents = this.myEvents.length;
    this.stats.totalParticipants = this.myEvents.reduce((total, event) => 
      total + event.participants.length, 0
    );
    this.stats.upcomingEvents = this.myEvents.filter(event => 
      new Date(event.date) > new Date()
    ).length;
  }

  getEventStatus(event: Event): string {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (eventDate < now) {
      return 'completed';
    } else if (eventDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return 'upcoming';
    } else {
      return 'scheduled';
    }
  }

  getTaskStatus(task: Task): string {
    const myAssignment = task.assignedTo.find(assignment => 
      assignment.user._id === this.currentUser?._id
    );
    return myAssignment?.status || 'not-assigned';
  }
}