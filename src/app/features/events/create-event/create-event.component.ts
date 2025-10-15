import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  categories = ['Workshop', 'Cultural', 'Community', 'Sports', 'Academic', 'Social', 'Other'];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      venue: this.fb.group({
        name: ['', [Validators.required]],
        address: ['', [Validators.required]]
      }),
      maxParticipants: [100, [Validators.required, Validators.min(1)]],
      requirements: [''],
      tags: [''],
      isPublic: [true]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.eventForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData: any = { ...this.eventForm.value };
      
      // Process requirements and tags
      if (typeof formData.requirements === 'string') {
        formData.requirements = formData.requirements
          .split(',')
          .map((req: string) => req.trim())
          .filter((req: string) => req);
      }
      if (typeof formData.tags === 'string') {
        formData.tags = formData.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag);
      }

      this.eventService.createEvent(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Event created successfully:', response);
          // Ideally redirect to the event detail or list so it appears
          // this.router.navigate(['/events', response.event._id]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create event. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters long`;
      }
      if (field.errors['min']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}