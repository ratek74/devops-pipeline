package com.taskmanager.controller;

import com.taskmanager.dto.ProjectDto;
import com.taskmanager.dto.TaskDto;
import com.taskmanager.security.CustomUserDetails;
import com.taskmanager.service.ProjectService;
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

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;

    @GetMapping("/api/workspaces/{workspaceId}/projects")
    @Operation(summary = "Get all projects in a workspace")
    public ResponseEntity<List<ProjectDto>> getProjectsForWorkspace(
            @PathVariable String workspaceId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(projectService.getProjectsForWorkspace(workspaceId, currentUser.getId()));
    }

    @PostMapping("/api/workspaces/{workspaceId}/projects")
    @Operation(summary = "Create a project in a workspace")
    public ResponseEntity<ProjectDto> createProject(
            @PathVariable String workspaceId,
            @Valid @RequestBody ProjectDto projectDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return new ResponseEntity<>(projectService.createProject(workspaceId, projectDto, currentUser.getId()), HttpStatus.CREATED);
    }

    @GetMapping("/api/projects/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ProjectDto> getProjectById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(projectService.getProjectById(id, currentUser.getId()));
    }

    @PutMapping("/api/projects/{id}")
    @Operation(summary = "Update a project")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable String id,
            @Valid @RequestBody ProjectDto projectDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDto, currentUser.getId()));
    }

    @DeleteMapping("/api/projects/{id}")
    @Operation(summary = "Delete a project and all its tasks")
    public ResponseEntity<Void> deleteProject(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        projectService.deleteProject(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/projects/{projectId}/tasks")
    @Operation(summary = "Get tasks for a specific project")
    public ResponseEntity<Page<TaskDto>> getTasksForProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, currentUser.getId(), pageable));
    }
}
