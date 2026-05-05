package com.towerdefense.service;

import com.towerdefense.dto.*;
import com.towerdefense.entity.User;
import com.towerdefense.repository.UserRepository;
import com.towerdefense.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles user registration and login.
 */
@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtils jwtUtils;

    /**
     * Registers a new user.
     *
     * @throws IllegalArgumentException if the username or email is already taken
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        String token = jwtUtils.generateJwt(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getId());
    }

    /**
     * Authenticates an existing user and returns a JWT.
     *
     * @throws BadCredentialsException if credentials are invalid
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));

        // If we reach here, authentication succeeded
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        String token = jwtUtils.generateJwt(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getId());
    }

    /**
     * Logs in the guest user without requiring a password.
     * Creates a JWT token for the guest account.
     */
    public AuthResponse loginAsGuest() {
        User guestUser = userRepository.findByUsername("guest")
                .orElseThrow(() -> new RuntimeException("Guest user not found"));

        String token = jwtUtils.generateJwt(guestUser.getUsername());
        return new AuthResponse(token, guestUser.getUsername(), guestUser.getId());
    }
}
