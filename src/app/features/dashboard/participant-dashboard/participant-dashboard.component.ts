import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, Event } from '../../../core/services/event.service';
import { TaskService, Task } from '../../../core/services/task.service';
import { AnnouncementService, Announcement } from '../../../core/services/announcement.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-participant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './participant-dashboard.component.html',
  styleUrls: ['./participant-dashboard.component.css']
})
export class ParticipantDashboardComponent implements OnInit {
  registeredEvents: Event[] = [];
  myTasks: Task[] = [];
  recentAnnouncements: Announcement[] = [];
  isLoading = true;
  stats = {
    registeredEvents: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    totalContributions: 0
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
    
    // Load events (this would need to be filtered by user's registered events)
    this.eventService.getEvents({ limit: 10 }).subscribe({
      next: (response) => {
        // Filter events where user is a participant
        this.registeredEvents = response.events.filter(event => 
          event.participants.some(participant => 
            participant.user._id === this.currentUser?._id
          )
        );
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      }
    });

    // Load user's tasks
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.myTasks = tasks.slice(0, 5);
        this.stats.completedTasks = tasks.filter(task => 
          task.assignedTo.some(assignment => 
            assignment.user._id === this.currentUser?._id && 
            assignment.status === 'completed'
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
    this.stats.registeredEvents = this.registeredEvents.length;
    this.stats.upcomingEvents = this.registeredEvents.filter(event => 
      new Date(event.date) > new Date()
    ).length;
    this.stats.totalContributions = this.myTasks.length;
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

  rsvpToEvent(eventId: string): void {
    this.eventService.rsvpToEvent(eventId).subscribe({
      next: (response) => {
        console.log('RSVP successful:', response);
        this.loadDashboardData(); // Reload data
      },
      error: (error) => {
        console.error('RSVP error:', error);
      }
    });
  }

  cancelRsvp(eventId: string): void {
    this.eventService.cancelRsvp(eventId).subscribe({
      next: (response) => {
        console.log('RSVP cancelled:', response);
        this.loadDashboardData(); // Reload data
      },
      error: (error) => {
        console.error('Cancel RSVP error:', error);
      }
    });
  }
}