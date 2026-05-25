package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDto {
    private String id;

    @NotBlank(message = "Project name cannot be blank")
    private String name;

    private String description;

    private String workspaceId;

    private String userId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private long totalTasks;

    private long completedTasks;

    private double completionPercentage;
}
