package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    Page<Task> findByUserId(String userId, Pageable pageable);
    Optional<Task> findByIdAndUserId(String id, String userId);
    Page<Task> findByProjectIdAndUserId(String projectId, String userId, Pageable pageable);
    Page<Task> findByUserIdAndProjectIdIsNull(String userId, Pageable pageable);
    List<Task> findByProjectId(String projectId);
    long countByProjectIdAndStatus(String projectId, TaskStatus status);
    long countByProjectId(String projectId);
    void deleteByProjectId(String projectId);
    void deleteByUserId(String userId);
}
