import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/services/event.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredEvents: Event[] = [];
  isLoading = true;
  isAuthenticated = false;
  userRole = '';

  constructor(
    private authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.userRole = user.role;
        }
      });
    }
    
    this.loadFeaturedEvents();
  }

  loadFeaturedEvents(): void {
    this.eventService.getEvents({ limit: 6, status: 'published' }).subscribe({
      next: (response: any) => {
        // Backend may return either an array of events or a paginated object
        this.featuredEvents = Array.isArray(response)
          ? response
          : (response?.events ?? []);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.featuredEvents = [];
        this.isLoading = false;
      }
    });
  }

  getDashboardRoute(): string {
    return this.userRole === 'organizer' ? '/dashboard' : '/participant';
  }
}