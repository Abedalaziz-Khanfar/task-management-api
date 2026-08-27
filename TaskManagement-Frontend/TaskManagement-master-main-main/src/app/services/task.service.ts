import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskItem, TaskCreateRequest, TaskUpdateRequest } from '../models/task.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = `${environment.apiUrl}/Tasks`;

  constructor(private http: HttpClient) {}

  getByCriteria(title?: string, statusId?: number | string | null): Observable<TaskItem[]> {
    let params = new HttpParams();
    if (title) params = params.set('title', title);
    if (statusId !== null && statusId !== undefined && statusId !== '') {
      params = params.set('statusId', statusId);
    }
    return this.http.get<TaskItem[]>(`${this.apiUrl}/GetByCriteria`, { params });
  }

  getById(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/GetById/${id}`);
  }

  add(data: TaskCreateRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(`${this.apiUrl}/Add`, data);
  }

  update(data: TaskUpdateRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.apiUrl}/Update`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Delete/${id}`);
  }
}
