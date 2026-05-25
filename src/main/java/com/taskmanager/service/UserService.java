package com.taskmanager.service;

import com.taskmanager.dto.ChangePasswordRequest;
import com.taskmanager.dto.UserProfileDto;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDto getUserProfile(String userId) {
        log.info("Fetching profile for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToProfileDto(user);
    }

    public UserProfileDto updateProfile(String userId, UserProfileDto profileDto) {
        log.info("Updating profile for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (profileDto.getDisplayName() != null) {
            user.setDisplayName(profileDto.getDisplayName());
        }
        if (profileDto.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(profileDto.getProfilePictureUrl());
        }

        User saved = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);
        return mapToProfileDto(saved);
    }

    public UserProfileDto updateUsername(String userId, String newUsername) {
        log.info("Updating username for user: {}", userId);
        if (userRepository.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setUsername(newUsername);

        User saved = userRepository.save(user);
        log.info("Username updated to {} for user: {}", newUsername, userId);
        return mapToProfileDto(saved);
    }

    public UserProfileDto updateEmail(String userId, String newEmail, String currentPassword) {
        log.info("Updating email for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Email is already in use");
        }

        user.setEmail(newEmail);
        User saved = userRepository.save(user);
        log.info("Email updated for user: {}", userId);
        return mapToProfileDto(saved);
    }

    public void changePassword(String userId, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", userId);
    }

    public boolean checkUsernameAvailability(String username) {
        return !userRepository.existsByUsername(username);
    }

    public void deleteAccount(String userId) {
        log.info("Deleting account for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Cascade delete everything
        taskRepository.deleteByUserId(userId);
        projectRepository.deleteByUserId(userId);
        workspaceRepository.deleteByUserId(userId);
        userRepository.delete(user);
        log.info("Account and all data deleted for user: {}", userId);
    }

    private UserProfileDto mapToProfileDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }
}
