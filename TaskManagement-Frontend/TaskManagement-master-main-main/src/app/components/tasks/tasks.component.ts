import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { TaskItem, TASK_STATUSES, UNKNOWN_STATUS } from '../../models/task.models';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  tasks: TaskItem[] = [];
  statuses = TASK_STATUSES;
  loading = false;
  errorMessage = '';

  filterForm: FormGroup;
  taskForm: FormGroup;

  showModal = false;
  isEditMode = false;
  editingId: number | null = null;

  showConfirmModal = false;
  taskToDeleteId: number | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      title: [''],
      statusId: ['']
    });

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      statusId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  get totalCount(): number { return this.tasks.length; }
  countByStatus(name: string): number {
    const status = this.statuses.find(s => s.name === name);
    return status ? this.tasks.filter(t => t.statusId === status.id).length : 0;
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';
    const { title, statusId } = this.filterForm.value;
    this.taskService.getByCriteria(title || undefined, statusId || null).subscribe({
      next: (data) => { this.tasks = data; this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load tasks'; this.loading = false; }
    });
  }

  applyFilter(): void {
    this.loadTasks();
  }

  resetFilter(): void {
    this.filterForm.reset({ title: '', statusId: '' });
    this.loadTasks();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.taskForm.reset();
    this.showModal = true;
  }

  openEditModal(task: TaskItem): void {
    this.isEditMode = true;
    this.editingId = task.id;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      fromDate: task.fromDate?.substring(0, 10),
      toDate: task.toDate?.substring(0, 10),
      statusId: task.statusId
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveTask(): void {
    if (this.taskForm.invalid) return;

    const value = this.taskForm.value;
    if (new Date(value.fromDate) > new Date(value.toDate)) {
      this.errorMessage = 'From date must be before or equal to To date';
      return;
    }

    if (this.isEditMode && this.editingId != null) {
      this.taskService.update({ id: this.editingId, ...value }).subscribe({
        next: () => { this.showModal = false; this.loadTasks(); },
        error: (err) => this.errorMessage = err.error?.message || 'Update failed'
      });
    } else {
      this.taskService.add(value).subscribe({
        next: () => { this.showModal = false; this.loadTasks(); },
        error: (err) => this.errorMessage = err.error?.message || 'Add failed'
      });
    }
  }

  deleteTask(id: number): void {
    this.taskToDeleteId = id;
    this.showConfirmModal = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId == null) return;
    const id = this.taskToDeleteId;
    this.taskService.delete(id).subscribe({
      next: () => { this.loadTasks(); this.cancelDelete(); },
      error: (err) => { this.errorMessage = err.error?.message || 'Delete failed'; this.cancelDelete(); }
    });
  }

  cancelDelete(): void {
    this.showConfirmModal = false;
    this.taskToDeleteId = null;
  }

  statusName(statusId: number): string {
    return this.statuses.find(s => s.id === statusId)?.name || UNKNOWN_STATUS.name;
  }

  statusBadgeClass(statusId: number): string {
    switch (this.statusName(statusId)) {
      case 'Initiated': return 'bg-secondary';
      case 'In Progress': return 'bg-primary';
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
