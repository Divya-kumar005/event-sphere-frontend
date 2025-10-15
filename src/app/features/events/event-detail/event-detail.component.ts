import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EventService, Event } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  isLoading = true;
  errorMessage = '';

  currentUser: any = null;

  constructor(
    private eventService: EventService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(eventId);
    }
  }

  loadEvent(eventId: string): void {
    this.isLoading = true;
    this.eventService.getEvent(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.errorMessage = 'Failed to load event details';
        this.isLoading = false;
      }
    });
  }

  isUserRegistered(): boolean {
    if (!this.event || !this.currentUser) return false;
    return this.event.participants.some(participant => 
      participant.user._id === this.currentUser?._id
    );
  }

  rsvpToEvent(): void {
    if (!this.event) return;
    
    this.eventService.rsvpToEvent(this.event._id).subscribe({
      next: (response) => {
        console.log('RSVP successful:', response);
        this.loadEvent(this.event!._id); // Reload event
      },
      error: (error) => {
        console.error('RSVP error:', error);
        alert(error.error?.message || 'Failed to RSVP to event');
      }
    });
  }

  cancelRsvp(): void {
    if (!this.event) return;
    
    this.eventService.cancelRsvp(this.event._id).subscribe({
      next: (response) => {
        console.log('RSVP cancelled:', response);
        this.loadEvent(this.event!._id); // Reload event
      },
      error: (error) => {
        console.error('Cancel RSVP error:', error);
        alert(error.error?.message || 'Failed to cancel RSVP');
      }
    });
  }

  getEventStatus(): string {
    if (!this.event) return '';
    const eventDate = new Date(this.event.date);
    const now = new Date();
    
    if (eventDate < now) {
      return 'completed';
    } else if (eventDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return 'upcoming';
    } else {
      return 'scheduled';
    }
  }

  isUserOrganizer(): boolean {
    if (!this.event || !this.currentUser) return false;
    return this.event.organizers.some((org: any) => 
      org.user._id === this.currentUser?._id
    );
  }
}