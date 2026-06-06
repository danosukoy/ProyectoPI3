package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.*;
import com.proyectopi3.backend.model.Role;
import com.proyectopi3.backend.model.User;
import com.proyectopi3.backend.repository.UserRepository;
import com.proyectopi3.backend.security.CustomUserDetails;
import com.proyectopi3.backend.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerUser_Success() {
        SignupRequest request = new SignupRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@utec.edu.pe");
        request.setPassword("password123");
        request.setRole("ROLE_PARTICIPANT");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("testuser@utec.edu.pe")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        ResponseEntity<?> response = authService.registerUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponse message = (MessageResponse) response.getBody();
        assertNotNull(message);
        assertEquals("User registered successfully!", message.getMessage());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_UsernameTaken() {
        SignupRequest request = new SignupRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@utec.edu.pe");
        request.setPassword("password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        ResponseEntity<?> response = authService.registerUser(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse message = (MessageResponse) response.getBody();
        assertNotNull(message);
        assertEquals("Error: Username is already taken!", message.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_EmailInUse() {
        SignupRequest request = new SignupRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@utec.edu.pe");
        request.setPassword("password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("testuser@utec.edu.pe")).thenReturn(true);

        ResponseEntity<?> response = authService.registerUser(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse message = (MessageResponse) response.getBody();
        assertNotNull(message);
        assertEquals("Error: Email is already in use!", message.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticateUser_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        Authentication authentication = mock(Authentication.class);
        CustomUserDetails userDetails = new CustomUserDetails(
                1L, "testuser", "testuser@utec.edu.pe", "encodedPassword",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_PARTICIPANT"))
        );

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwtToken");

        JwtResponse response = authService.authenticateUser(request);

        assertNotNull(response);
        assertEquals("jwtToken", response.getToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("testuser@utec.edu.pe", response.getEmail());
        assertEquals("ROLE_PARTICIPANT", response.getRole());
    }

    @Test
    void authenticateGoogleUser_MockToken_Success() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setIdToken("mock-google-token");

        User user = User.builder()
                .id(1L)
                .username("nubia.elena")
                .email("nubia.elena@utec.edu.pe")
                .password("encodedPassword")
                .role(Role.ROLE_PARTICIPANT)
                .build();

        when(userRepository.findByEmail("nubia.elena@utec.edu.pe")).thenReturn(Optional.of(user));
        when(jwtUtils.generateJwtTokenFromUser("nubia.elena", "nubia.elena@utec.edu.pe", "ROLE_PARTICIPANT")).thenReturn("jwtToken");

        JwtResponse response = authService.authenticateGoogleUser(request);

        assertNotNull(response);
        assertEquals("jwtToken", response.getToken());
        assertEquals("Nubia Elena", response.getUsername());
        assertEquals("nubia.elena@utec.edu.pe", response.getEmail());
        assertEquals("ROLE_PARTICIPANT", response.getRole());
    }

    @Test
    void authenticateGoogleUser_InvalidToken_ThrowsException() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setIdToken("invalid-google-token");

        assertThrows(RuntimeException.class, () -> authService.authenticateGoogleUser(request));
    }
}
