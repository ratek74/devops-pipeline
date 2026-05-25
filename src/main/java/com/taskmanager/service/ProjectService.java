package com.taskmanager.service;

import com.taskmanager.dto.ProjectDto;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Project;
import com.taskmanager.model.TaskStatus;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;

    public List<ProjectDto> getProjectsForWorkspace(String workspaceId, String userId) {
        log.info("Fetching projects for workspace {} user {}", workspaceId, userId);
        // Verify workspace belongs to user
        workspaceRepository.findByIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));

        return projectRepository.findByWorkspaceIdAndUserId(workspaceId, userId).stream()
                .map(this::mapToDtoWithStats)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getAllProjectsForUser(String userId) {
        log.info("Fetching all projects for user {}", userId);
        return projectRepository.findByUserId(userId).stream()
                .map(this::mapToDtoWithStats)
                .collect(Collectors.toList());
    }

    public ProjectDto getProjectById(String id, String userId) {
        log.info("Fetching project {} for user {}", id, userId);
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToDtoWithStats(project);
    }

    public ProjectDto createProject(String workspaceId, ProjectDto projectDto, String userId) {
        log.info("Creating project in workspace {} for user {}", workspaceId, userId);
        // Verify workspace belongs to user
        workspaceRepository.findByIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));

        Project project = Project.builder()
                .name(projectDto.getName())
                .description(projectDto.getDescription())
                .workspaceId(workspaceId)
                .userId(userId)
                .build();

        Project saved = projectRepository.save(project);
        log.info("Project created with id: {}", saved.getId());
        return mapToDtoWithStats(saved);
    }

    public ProjectDto updateProject(String id, ProjectDto projectDto, String userId) {
        log.info("Updating project {} for user {}", id, userId);
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setName(projectDto.getName());
        project.setDescription(projectDto.getDescription());

        Project updated = projectRepository.save(project);
        log.info("Project {} updated", updated.getId());
        return mapToDtoWithStats(updated);
    }

    public void deleteProject(String id, String userId) {
        log.info("Deleting project {} for user {}", id, userId);
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Cascade: delete all tasks in this project
        taskRepository.deleteByProjectId(id);
        projectRepository.delete(project);
        log.info("Project {} and all tasks deleted", id);
    }

    private ProjectDto mapToDtoWithStats(Project project) {
        long totalTasks = taskRepository.countByProjectId(project.getId());
        long completedTasks = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.COMPLETED);
        double completionPercentage = totalTasks > 0 ? (double) completedTasks / totalTasks * 100.0 : 0.0;

        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .workspaceId(project.getWorkspaceId())
                .userId(project.getUserId())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .completionPercentage(Math.round(completionPercentage * 10.0) / 10.0)
                .build();
    }
}
