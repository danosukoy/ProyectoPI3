package com.proyectopi3.backend.config;

import com.proyectopi3.backend.model.*;
import com.proyectopi3.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DisciplineRepository disciplineRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed Users if empty
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@university.edu")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .build();
            userRepository.save(admin);

            User organizer = User.builder()
                    .username("organizer")
                    .email("organizer@university.edu")
                    .password(passwordEncoder.encode("organizer123"))
                    .role(Role.ROLE_ORGANIZER)
                    .build();
            userRepository.save(organizer);

            User participant = User.builder()
                    .username("participant")
                    .email("participant@university.edu")
                    .password(passwordEncoder.encode("participant123"))
                    .role(Role.ROLE_PARTICIPANT)
                    .build();
            userRepository.save(participant);
            
            System.out.println("Seeded initial users (admin/admin123, organizer/organizer123, participant/participant123)");
        }

        // Seed Disciplines if empty
        if (disciplineRepository.count() == 0) {
            Discipline futbol = Discipline.builder()
                    .name("Fútbol Masculino")
                    .description("Torneo Interfacultades de Fútbol 11")
                    .build();
            disciplineRepository.save(futbol);

            Discipline basquet = Discipline.builder()
                    .name("Básquetbol Femenino")
                    .description("Liga Universitaria de Básquetbol Femenil")
                    .build();
            disciplineRepository.save(basquet);

            Discipline volei = Discipline.builder()
                    .name("Voleibol Mixto")
                    .description("Copa Amistosa de Voleibol Mixto")
                    .build();
            disciplineRepository.save(volei);

            System.out.println("Seeded initial disciplines");
        }

        // Seed Locations if empty
        if (locationRepository.count() == 0) {
            Location campoA = Location.builder()
                    .name("Estadio Universitario - Campo A")
                    .address("Av. Universitaria 1234, Campus Principal")
                    .build();
            locationRepository.save(campoA);

            Location coliseo = Location.builder()
                    .name("Coliseo Multiusos")
                    .address("Av. De los Deportes 567, Sede Norte")
                    .build();
            locationRepository.save(coliseo);

            System.out.println("Seeded initial locations");
        }

        // Seed Teams if empty
        if (teamRepository.count() == 0) {
            Team ing = Team.builder()
                    .name("Leones de Ingeniería")
                    .university("Universidad Nacional")
                    .build();
            teamRepository.save(ing);

            Team med = Team.builder()
                    .name("Coyotes de Medicina")
                    .university("Universidad Nacional")
                    .build();
            teamRepository.save(med);

            Team cs = Team.builder()
                    .name("Tiburones de Ciencias")
                    .university("Universidad Central")
                    .build();
            teamRepository.save(cs);

            System.out.println("Seeded initial teams");
        }

        // Seed Matches if empty
        if (matchRepository.count() == 0) {
            Discipline futbol = disciplineRepository.findByNameIgnoreCase("Fútbol Masculino").orElse(null);
            Location campoA = locationRepository.findByNameIgnoreCase("Estadio Universitario - Campo A").orElse(null);
            Team ing = teamRepository.findByUniversityIgnoreCase("Universidad Nacional").stream()
                    .filter(t -> t.getName().contains("Ingeniería")).findFirst().orElse(null);
            Team med = teamRepository.findByUniversityIgnoreCase("Universidad Nacional").stream()
                    .filter(t -> t.getName().contains("Medicina")).findFirst().orElse(null);

            if (futbol != null && campoA != null && ing != null && med != null) {
                UniversityMatch match = UniversityMatch.builder()
                        .title("Clásico Interfacultades: Ingeniería vs Medicina")
                        .description("Partido inaugural de la Copa Deportes 2026")
                        .matchDateTime(LocalDateTime.now().plusDays(5))
                        .location(campoA)
                        .discipline(futbol)
                        .homeTeam(ing)
                        .awayTeam(med)
                        .homeScore(null)
                        .awayScore(null)
                        .organizer("Oficina de Bienestar Universitario")
                        .status(MatchStatus.SCHEDULED)
                        .build();
                matchRepository.save(match);
                System.out.println("Seeded initial university match");
            }
        }
    }
}
