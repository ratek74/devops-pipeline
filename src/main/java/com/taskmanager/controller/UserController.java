package com.taskmanager.controller;

import com.taskmanager.dto.ChangePasswordRequest;
import com.taskmanager.dto.UserProfileDto;
import com.taskmanager.security.CustomUserDetails;
import com.taskmanager.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "User", description = "User Profile & Settings APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserProfileDto> getProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(userService.getUserProfile(currentUser.getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile (displayName, profilePictureUrl)")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestBody UserProfileDto profileDto,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), profileDto));
    }

    @PutMapping("/username")
    @Operation(summary = "Change username")
    public ResponseEntity<UserProfileDto> updateUsername(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        String newUsername = body.get("username");
        if (newUsername == null || newUsername.isBlank()) {
            throw new IllegalArgumentException("Username cannot be blank");
        }
        return ResponseEntity.ok(userService.updateUsername(currentUser.getId(), newUsername));
    }

    @PutMapping("/email")
    @Operation(summary = "Change email (requires current password)")
    public ResponseEntity<UserProfileDto> updateEmail(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        String newEmail = body.get("email");
        String currentPassword = body.get("currentPassword");
        if (newEmail == null || newEmail.isBlank()) {
            throw new IllegalArgumentException("Email cannot be blank");
        }
        if (currentPassword == null || currentPassword.isBlank()) {
            throw new IllegalArgumentException("Current password is required");
        }
        return ResponseEntity.ok(userService.updateEmail(currentUser.getId(), newEmail, currentPassword));
    }

    @PutMapping("/password")
    @Operation(summary = "Change password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/check-username/{username}")
    @Operation(summary = "Check if username is available")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@PathVariable String username) {
        boolean available = userService.checkUsernameAvailability(username);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @DeleteMapping("/account")
    @Operation(summary = "Delete account and all data")
    public ResponseEntity<Void> deleteAccount(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.deleteAccount(currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
