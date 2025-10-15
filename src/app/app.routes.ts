import { Route } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { EventListComponent } from './features/events/event-list/event-list.component';
import { EventDetailComponent } from './features/events/event-detail/event-detail.component';
import { CreateEventComponent } from './features/events/create-event/create-event.component';
import { OrganizerChatComponent } from './features/events/organizer-chat/organizer-chat.component';
import { OrganizerDashboardComponent } from './features/dashboard/organizer-dashboard/organizer-dashboard.component';
import { ParticipantDashboardComponent } from './features/dashboard/participant-dashboard/participant-dashboard.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { authGuard } from './core/guards/auth.guard';
import { ProfileComponent } from './features/profile/profile.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Route[] = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'events/:id/organizer-chat', component: OrganizerChatComponent, canActivate: [authGuard] },
  { path: 'create-event', component: CreateEventComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: OrganizerDashboardComponent, canActivate: [authGuard] },
  { path: 'participant', component: ParticipantDashboardComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
