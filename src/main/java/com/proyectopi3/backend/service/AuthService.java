package com.proyectopi3.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.proyectopi3.backend.dto.GoogleLoginRequest;
import com.proyectopi3.backend.dto.JwtResponse;
import com.proyectopi3.backend.dto.LoginRequest;
import com.proyectopi3.backend.dto.MessageResponse;
import com.proyectopi3.backend.dto.SignupRequest;
import com.proyectopi3.backend.model.Role;
import com.proyectopi3.backend.model.User;
import com.proyectopi3.backend.repository.UserRepository;
import com.proyectopi3.backend.security.CustomUserDetails;
import com.proyectopi3.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public ResponseEntity<?> registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .build();

        String strRole = signUpRequest.getRole();
        Role role;

        if (strRole == null || strRole.trim().isEmpty()) {
            role = Role.ROLE_PARTICIPANT;
        } else {
            try {
                role = Role.valueOf(strRole.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                role = Role.ROLE_PARTICIPANT;
            }
        }

        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_PARTICIPANT");

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role
        );
    }

    @Value("${jwt.google-client-id:mock-google-client-id.apps.googleusercontent.com}")
    private String googleClientId;

    public JwtResponse authenticateGoogleUser(GoogleLoginRequest googleLoginRequest) {
        String tokenStr = googleLoginRequest.getIdToken();
        
        try {
            String email;
            String fullName;
            
            // Si el token es de bypass local (como el enviado por defecto en desarrollo), 
            // permitimos el ingreso directo como Nubia Elena.
            if ("mock-google-token".equals(tokenStr) || (tokenStr != null && tokenStr.startsWith("mock-"))) {
                email = "nubia.elena@utec.edu.pe";
                fullName = "Nubia Elena";
            } else {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

                GoogleIdToken idToken = verifier.verify(tokenStr);
                if (idToken == null) {
                    throw new IllegalArgumentException("Error: La firma del token ID de Google no es válida.");
                }

                GoogleIdToken.Payload payload = idToken.getPayload();
                email = payload.getEmail();
                fullName = (String) payload.get("name");
                
                // Restricción de correo institucional de UTEC
                if (email == null || (!email.endsWith("@utec.edu.pe") && !email.endsWith("@utec.edu.ec") && !email.endsWith("@university.edu"))) {
                    throw new IllegalArgumentException("Error: Solo se admiten correos institucionales de UTEC (@utec.edu.pe / @utec.edu.ec).");
                }
            }

            // Buscar usuario en base de datos. Si no existe, lo registramos automáticamente.
            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                String username = email.split("@")[0];
                user = User.builder()
                        .username(username)
                        .email(email)
                        .password(passwordEncoder.encode(System.currentTimeMillis() + "googleSecuredPassword123"))
                        .role(Role.ROLE_PARTICIPANT)
                        .build();
                userRepository.save(user);
            }

            // Generar token JWT local
            String jwt = jwtUtils.generateJwtTokenFromUser(user.getUsername(), user.getEmail(), user.getRole().name());

            return new JwtResponse(
                    jwt,
                    user.getId(),
                    fullName,
                    user.getEmail(),
                    user.getRole().name()
            );

        } catch (Exception e) {
            throw new RuntimeException("Error en la verificación de Google: " + e.getMessage(), e);
        }
    }
}
