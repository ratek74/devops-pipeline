package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task task;
    private TaskDto taskDto;

    @BeforeEach
    void setUp() {
        task = Task.builder()
                .id("1")
                .title("Test Task")
                .description("Test Description")
                .status(TaskStatus.TODO)
                .userId("user1")
                .build();

        taskDto = TaskDto.builder()
                .title("Test Task")
                .description("Test Description")
                .status(TaskStatus.TODO)
                .build();
    }

    @Test
    void testGetAllTasks() {
        when(taskRepository.findByUserId(eq("user1"), any())).thenReturn(new PageImpl<>(List.of(task)));

        Page<TaskDto> result = taskService.getAllTasks("user1", PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Task", result.getContent().get(0).getTitle());
    }

    @Test
    void testGetTaskById() {
        when(taskRepository.findByIdAndUserId("1", "user1")).thenReturn(Optional.of(task));

        TaskDto result = taskService.getTaskById("1", "user1");

        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
    }

    @Test
    void testGetTaskByIdNotFound() {
        when(taskRepository.findByIdAndUserId("1", "user1")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById("1", "user1"));
    }

    @Test
    void testCreateTask() {
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskDto result = taskService.createTask(taskDto, "user1");

        assertNotNull(result);
        assertEquals("1", result.getId());
        verify(taskRepository, times(1)).save(any(Task.class));
    }
}
