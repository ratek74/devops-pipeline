package com.taskmanager.controller;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.security.CustomUserDetails;
import com.taskmanager.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "Get all tasks for current user with pagination and sorting")
    public ResponseEntity<Page<TaskDto>> getAllTasks(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return ResponseEntity.ok(taskService.getAllTasks(currentUser.getId(), pageable));
    }

    @GetMapping("/inbox")
    @Operation(summary = "Get unassigned tasks (no project) for current user")
    public ResponseEntity<Page<TaskDto>> getInboxTasks(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return ResponseEntity.ok(taskService.getUnassignedTasks(currentUser.getId(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskDto> getTaskById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(taskService.getTaskById(id, currentUser.getId()));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskDto> createTask(
            @Valid @RequestBody TaskDto taskDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return new ResponseEntity<>(taskService.createTask(taskDto, currentUser.getId()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing task")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskDto taskDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDto, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> deleteTask(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        taskService.deleteTask(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
