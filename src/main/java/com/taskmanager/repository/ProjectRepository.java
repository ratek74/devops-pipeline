package com.taskmanager.repository;

import com.taskmanager.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByWorkspaceIdAndUserId(String workspaceId, String userId);
    List<Project> findByUserId(String userId);
    Optional<Project> findByIdAndUserId(String id, String userId);
    void deleteByWorkspaceId(String workspaceId);
    void deleteByUserId(String userId);
    long countByWorkspaceId(String workspaceId);
}
