package com.taskmanager.service;

import com.taskmanager.dto.WorkspaceDto;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Workspace;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public List<WorkspaceDto> getWorkspacesForUser(String userId) {
        log.info("Fetching workspaces for user: {}", userId);
        return workspaceRepository.findByUserId(userId).stream()
                .map(ws -> {
                    WorkspaceDto dto = mapToDto(ws);
                    dto.setProjectCount(projectRepository.countByWorkspaceId(ws.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public WorkspaceDto getWorkspaceById(String id, String userId) {
        log.info("Fetching workspace {} for user {}", id, userId);
        Workspace workspace = workspaceRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + id));
        WorkspaceDto dto = mapToDto(workspace);
        dto.setProjectCount(projectRepository.countByWorkspaceId(workspace.getId()));
        return dto;
    }

    public WorkspaceDto createWorkspace(WorkspaceDto workspaceDto, String userId) {
        log.info("Creating workspace for user: {}", userId);
        Workspace workspace = Workspace.builder()
                .name(workspaceDto.getName())
                .description(workspaceDto.getDescription())
                .color(workspaceDto.getColor())
                .userId(userId)
                .build();

        Workspace saved = workspaceRepository.save(workspace);
        log.info("Workspace created with id: {}", saved.getId());
        return mapToDto(saved);
    }

    public WorkspaceDto updateWorkspace(String id, WorkspaceDto workspaceDto, String userId) {
        log.info("Updating workspace {} for user {}", id, userId);
        Workspace workspace = workspaceRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + id));

        workspace.setName(workspaceDto.getName());
        workspace.setDescription(workspaceDto.getDescription());
        workspace.setColor(workspaceDto.getColor());

        Workspace updated = workspaceRepository.save(workspace);
        log.info("Workspace {} updated", updated.getId());
        return mapToDto(updated);
    }

    public void deleteWorkspace(String id, String userId) {
        log.info("Deleting workspace {} for user {}", id, userId);
        Workspace workspace = workspaceRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + id));

        // Cascade: delete all tasks in projects of this workspace
        List<com.taskmanager.model.Project> projects = projectRepository.findByWorkspaceIdAndUserId(id, userId);
        for (com.taskmanager.model.Project project : projects) {
            taskRepository.deleteByProjectId(project.getId());
        }
        // Cascade: delete all projects in this workspace
        projectRepository.deleteByWorkspaceId(id);
        // Delete workspace itself
        workspaceRepository.delete(workspace);
        log.info("Workspace {} and all contained projects/tasks deleted", id);
    }

    private WorkspaceDto mapToDto(Workspace workspace) {
        return WorkspaceDto.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .color(workspace.getColor())
                .userId(workspace.getUserId())
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }
}
