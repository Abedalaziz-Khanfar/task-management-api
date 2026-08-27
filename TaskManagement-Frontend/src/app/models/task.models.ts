export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  fromDate: string;
  toDate: string;
  statusId: number;
  statusName?: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  fromDate: string;
  toDate: string;
  statusId: number;
}

export interface TaskUpdateRequest extends TaskCreateRequest {
  id: number;
}

export const TASK_STATUSES = [
  { id: 2, name: 'Initiated' },
  { id: 3, name: 'In Progress' },
  { id: 4, name: 'Completed' },
  { id: 5, name: 'Cancelled' },
];

// Fallback used when a task's statusId doesn't match any known status above
// (e.g. data seeded directly in the backend with a different status id).
export const UNKNOWN_STATUS = { id: -1, name: 'Pending' };
