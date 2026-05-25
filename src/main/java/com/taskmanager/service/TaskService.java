package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public Page<TaskDto> getAllTasks(String userId, Pageable pageable) {
        log.info("Fetching all tasks for user: {}", userId);
        return taskRepository.findByUserId(userId, pageable).map(this::mapToDto);
    }

    public Page<TaskDto> getUnassignedTasks(String userId, Pageable pageable) {
        log.info("Fetching unassigned tasks for user: {}", userId);
        return taskRepository.findByUserIdAndProjectIdIsNull(userId, pageable).map(this::mapToDto);
    }

    public Page<TaskDto> getTasksByProject(String projectId, String userId, Pageable pageable) {
        log.info("Fetching tasks for project {} user {}", projectId, userId);
        return taskRepository.findByProjectIdAndUserId(projectId, userId, pageable).map(this::mapToDto);
    }

    public TaskDto getTaskById(String id, String userId) {
        log.info("Fetching task {} for user {}", id, userId);
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return mapToDto(task);
    }

    public TaskDto createTask(TaskDto taskDto, String userId) {
        log.info("Creating new task for user: {}", userId);
        Task task = Task.builder()
                .title(taskDto.getTitle())
                .description(taskDto.getDescription())
                .status(taskDto.getStatus() != null ? taskDto.getStatus() : TaskStatus.TODO)
                .dueDate(taskDto.getDueDate())
                .userId(userId)
                .workspaceId(taskDto.getWorkspaceId())
                .projectId(taskDto.getProjectId())
                .build();
        
        Task savedTask = taskRepository.save(task);
        log.info("Task created successfully with id: {}", savedTask.getId());
        return mapToDto(savedTask);
    }

    public TaskDto updateTask(String id, TaskDto taskDto, String userId) {
        log.info("Updating task {} for user {}", id, userId);
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setStatus(taskDto.getStatus());
        task.setDueDate(taskDto.getDueDate());
        task.setWorkspaceId(taskDto.getWorkspaceId());
        task.setProjectId(taskDto.getProjectId());

        Task updatedTask = taskRepository.save(task);
        log.info("Task {} updated successfully", updatedTask.getId());
        return mapToDto(updatedTask);
    }

    public void deleteTask(String id, String userId) {
        log.info("Deleting task {} for user {}", id, userId);
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        
        taskRepository.delete(task);
        log.info("Task {} deleted successfully", id);
    }

    private TaskDto mapToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .userId(task.getUserId())
                .workspaceId(task.getWorkspaceId())
                .projectId(task.getProjectId())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
