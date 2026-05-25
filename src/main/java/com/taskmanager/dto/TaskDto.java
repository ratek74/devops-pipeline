package com.taskmanager.dto;

import com.taskmanager.model.TaskStatus;
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
public class TaskDto {
    private String id;
    
    @NotBlank(message = "Title cannot be blank")
    private String title;
    
    private String description;
    
    private TaskStatus status;
    
    private LocalDateTime dueDate;
    
    private String userId;

    private String workspaceId;

    private String projectId;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
