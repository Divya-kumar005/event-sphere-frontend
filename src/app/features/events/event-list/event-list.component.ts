import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService, Event, EventListResponse } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  totalEvents = 0;
  selectedCategory = '';
  selectedStatus = '';
  
  categories = ['All', 'Workshop', 'Cultural', 'Community', 'Sports', 'Academic', 'Social', 'Other'];
  statuses = ['All', 'published', 'draft', 'cancelled', 'completed'];

  currentUser: any = null;

  constructor(
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      limit: 12
    };

    if (this.selectedCategory && this.selectedCategory !== 'All') {
      params.category = this.selectedCategory;
    }

    if (this.selectedStatus && this.selectedStatus !== 'All') {
      params.status = this.selectedStatus;
    }

    this.eventService.getEvents(params).subscribe({
      next: (response: EventListResponse) => {
        this.events = response.events;
        this.totalPages = response.totalPages;
        this.totalEvents = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadEvents();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadEvents();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEvents();
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

  isUserRegistered(event: Event): boolean {
    if (!this.currentUser) return false;
    return event.participants.some(participant => 
      participant.user._id === this.currentUser?._id
    );
  }

  rsvpToEvent(eventId: string): void {
    this.eventService.rsvpToEvent(eventId).subscribe({
      next: (response) => {
        console.log('RSVP successful:', response);
        this.loadEvents(); // Reload events
      },
      error: (error) => {
        console.error('RSVP error:', error);
        alert(error.error?.message || 'Failed to RSVP to event');
      }
    });
  }

  cancelRsvp(eventId: string): void {
    this.eventService.cancelRsvp(eventId).subscribe({
      next: (response) => {
        console.log('RSVP cancelled:', response);
        this.loadEvents(); // Reload events
      },
      error: (error) => {
        console.error('Cancel RSVP error:', error);
        alert(error.error?.message || 'Failed to cancel RSVP');
      }
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}