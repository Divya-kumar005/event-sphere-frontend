import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrganizerChatService, ChatMessage, CollaborationSummary } from '../../../core/services/organizer-chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-organizer-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './organizer-chat.component.html',
  styleUrls: ['./organizer-chat.component.css']
})
export class OrganizerChatComponent implements OnInit, OnDestroy {
  eventId: string = '';
  messages: ChatMessage[] = [];
  organizers: any[] = [];
  currentUser: any = null;
  newMessage: string = '';
  isVote: boolean = false;
  voteOptions: string[] = ['Yes', 'No'];
  newVoteOption: string = '';
  isLoading = false;
  showVotingResults: { [messageId: string]: boolean } = {};
  collaborationSummary: CollaborationSummary | null = null;
  showSummary = false;

  private destroy$ = new Subject<void>();
  private refreshInterval?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private organizerChatService: OrganizerChatService,
    private authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    if (this.eventId) {
      this.loadChatMessages();
      this.loadEventDetails();
      this.startAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  loadChatMessages(): void {
    this.organizerChatService.getChatMessages(this.eventId).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.organizers = response.organizers;
      },
      error: (error) => {
        console.error('Error loading chat messages:', error);
      }
    });
  }

  loadEventDetails(): void {
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        // Verify user is an organizer
        const isOrganizer = event.organizers.some(
          (org: any) => org.user._id === this.currentUser?._id
        );
        if (!isOrganizer) {
          console.error('User is not an organizer for this event');
        }
      },
      error: (error) => {
        console.error('Error loading event details:', error);
      }
    });
  }

  startAutoRefresh(): void {
    // Refresh messages every 5 seconds
    this.refreshInterval = interval(5000).subscribe(() => {
      this.loadChatMessages();
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    this.isLoading = true;
    const message = this.newMessage.trim();
    const voteOptions = this.isVote ? this.voteOptions : undefined;

    this.organizerChatService.addMessage(this.eventId, message, this.isVote, voteOptions).subscribe({
      next: (response) => {
        this.newMessage = '';
        this.isVote = false;
        this.voteOptions = ['Yes', 'No'];
        this.loadChatMessages(); // Refresh messages
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isLoading = false;
      }
    });
  }

  voteOnMessage(messageId: string, vote: string, voteOption?: string): void {
    this.organizerChatService.voteOnMessage(this.eventId, messageId, vote, voteOption).subscribe({
      next: (response) => {
        this.loadChatMessages(); // Refresh messages
      },
      error: (error) => {
        console.error('Error voting on message:', error);
      }
    });
  }

  toggleVotingResults(messageId: string): void {
    this.showVotingResults[messageId] = !this.showVotingResults[messageId];
  }

  getVotingResults(messageId: string): void {
    this.organizerChatService.getVotingResults(this.eventId, messageId).subscribe({
      next: (response) => {
        // Handle voting results display
        console.log('Voting results:', response);
      },
      error: (error) => {
        console.error('Error getting voting results:', error);
      }
    });
  }

  addVoteOption(): void {
    if (this.newVoteOption.trim() && !this.voteOptions.includes(this.newVoteOption.trim())) {
      this.voteOptions.push(this.newVoteOption.trim());
      this.newVoteOption = '';
    }
  }

  removeVoteOption(option: string): void {
    this.voteOptions = this.voteOptions.filter(opt => opt !== option);
  }

  loadCollaborationSummary(): void {
    this.organizerChatService.getCollaborationSummary(this.eventId).subscribe({
      next: (response) => {
        this.collaborationSummary = response.summary;
        this.showSummary = true;
      },
      error: (error) => {
        console.error('Error loading collaboration summary:', error);
      }
    });
  }

  deleteMessage(messageId: string): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.organizerChatService.deleteMessage(this.eventId, messageId).subscribe({
        next: (response) => {
          this.loadChatMessages(); // Refresh messages
        },
        error: (error) => {
          console.error('Error deleting message:', error);
        }
      });
    }
  }

  canDeleteMessage(message: ChatMessage): boolean {
    if (!this.currentUser) return false;
    
    // User can delete their own messages
    if (message.user._id === this.currentUser._id) return true;
    
    // Check if user is admin
    const userOrg = this.organizers.find(org => org.user._id === this.currentUser._id);
    return userOrg?.role === 'admin';
  }

  hasUserVoted(message: ChatMessage): boolean {
    if (!this.currentUser) return false;
    return message.votes.some(vote => vote.user === this.currentUser._id);
  }

  getUserVote(message: ChatMessage): string | null {
    if (!this.currentUser) return null;
    const userVote = message.votes.find(vote => vote.user === this.currentUser._id);
    return userVote ? (userVote.voteOption || userVote.vote) : null;
  }

  getVoteCount(message: ChatMessage, option: string): number {
    return message.votes.filter(vote => 
      (vote.voteOption || vote.vote) === option
    ).length;
  }

  getTotalVotes(message: ChatMessage): number {
    return message.votes.length;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message._id;
  }
}
