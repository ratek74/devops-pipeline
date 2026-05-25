package com.taskmanager.controller;

import com.taskmanager.dto.WorkspaceDto;
import com.taskmanager.security.CustomUserDetails;
import com.taskmanager.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
@Tag(name = "Workspaces", description = "Workspace Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping
    @Operation(summary = "Get all workspaces for current user")
    public ResponseEntity<List<WorkspaceDto>> getAllWorkspaces(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(workspaceService.getWorkspacesForUser(currentUser.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get workspace by ID")
    public ResponseEntity<WorkspaceDto> getWorkspaceById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(workspaceService.getWorkspaceById(id, currentUser.getId()));
    }

    @PostMapping
    @Operation(summary = "Create a new workspace")
    public ResponseEntity<WorkspaceDto> createWorkspace(
            @Valid @RequestBody WorkspaceDto workspaceDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return new ResponseEntity<>(workspaceService.createWorkspace(workspaceDto, currentUser.getId()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a workspace")
    public ResponseEntity<WorkspaceDto> updateWorkspace(
            @PathVariable String id,
            @Valid @RequestBody WorkspaceDto workspaceDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(id, workspaceDto, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a workspace and all its projects/tasks")
    public ResponseEntity<Void> deleteWorkspace(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        workspaceService.deleteWorkspace(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
