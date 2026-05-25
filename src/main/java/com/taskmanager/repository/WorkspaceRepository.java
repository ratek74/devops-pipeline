package com.taskmanager.repository;

import com.taskmanager.model.Workspace;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends MongoRepository<Workspace, String> {
    List<Workspace> findByUserId(String userId);
    Optional<Workspace> findByIdAndUserId(String id, String userId);
    void deleteByUserId(String userId);
}
