package com.towerdefense.controller;

import com.towerdefense.dto.*;
import com.towerdefense.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints.
 * Handles user registration, login, and guest login.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/register — Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.ok("User registered successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login — Login with username and password
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid credentials"));
        }
    }

    /**
     * POST /api/auth/guest — Login as guest (no credentials needed)
     */
    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<AuthResponse>> loginAsGuest() {
        try {
            AuthResponse response = authService.loginAsGuest();
            return ResponseEntity.ok(ApiResponse.ok("Guest login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Guest login failed: " + e.getMessage()));
        }
    }
}
