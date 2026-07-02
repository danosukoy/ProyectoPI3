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
    private CourseRepository courseRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private StudyGroupRepository studyGroupRepository;

    @Autowired
    private BookingRepository bookingRepository;

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

            User diego = User.builder()
                    .username("Diego Alva")
                    .email("diego.alva@utec.edu.pe")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.ROLE_PARTICIPANT)
                    .career("Ciencias de la Computación")
                    .build();
            userRepository.save(diego);

            User mateo = User.builder()
                    .username("Mateo Rojas")
                    .email("mateo.rojas@utec.edu.pe")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.ROLE_PARTICIPANT)
                    .career("Sistemas de la Información")
                    .build();
            userRepository.save(mateo);

            User lucia = User.builder()
                    .username("Lucía Méndez")
                    .email("lucia.mendez@utec.edu.pe")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.ROLE_PARTICIPANT)
                    .career("Ingeniería Civil")
                    .build();
            userRepository.save(lucia);
            
            System.out.println("Seeded initial users and student profiles");
        }

        // Seed Courses if empty
        if (courseRepository.count() == 0) {
            Course futbol = Course.builder()
                    .name("Fútbol Masculino")
                    .description("Torneo Interfacultades de Fútbol 11")
                    .build();
            courseRepository.save(futbol);

            Course basquet = Course.builder()
                    .name("Básquetbol Femenino")
                    .description("Liga Universitaria de Básquetbol Femenil")
                    .build();
            courseRepository.save(basquet);

            Course volei = Course.builder()
                    .name("Voleibol Mixto")
                    .description("Copa Amistosa de Voleibol Mixto")
                    .build();
            courseRepository.save(volei);

            System.out.println("Seeded initial courses");
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

        // Seed StudyGroups if empty
        if (studyGroupRepository.count() == 0) {
            StudyGroup ing = StudyGroup.builder()
                    .name("Leones de Ingeniería")
                    .courseName("Universidad Nacional")
                    .build();
            studyGroupRepository.save(ing);

            StudyGroup med = StudyGroup.builder()
                    .name("Coyotes de Medicina")
                    .courseName("Universidad Nacional")
                    .build();
            studyGroupRepository.save(med);

            StudyGroup cs = StudyGroup.builder()
                    .name("Tiburones de Ciencias")
                    .courseName("Universidad Central")
                    .build();
            studyGroupRepository.save(cs);

            System.out.println("Seeded initial study_groups");
        }

        // Seed Matches if empty
        if (bookingRepository.count() == 0) {
            Course futbol = courseRepository.findByNameIgnoreCase("Fútbol Masculino").orElse(null);
            Location campoA = locationRepository.findByNameIgnoreCase("Estadio Universitario - Campo A").orElse(null);
            StudyGroup ing = studyGroupRepository.findByCourseNameIgnoreCase("Universidad Nacional").stream()
                    .filter(t -> t.getName().contains("Ingeniería")).findFirst().orElse(null);
            StudyGroup med = studyGroupRepository.findByCourseNameIgnoreCase("Universidad Nacional").stream()
                    .filter(t -> t.getName().contains("Medicina")).findFirst().orElse(null);

            if (futbol != null && campoA != null && ing != null && med != null) {
                Booking match = Booking.builder()
                        .title("Clásico Interfacultades: Ingeniería vs Medicina")
                        .description("Partido inaugural de la Copa Deportes 2026")
                        .bookingDateTime(LocalDateTime.now().plusDays(5))
                        .location(campoA)
                        .course(futbol)
                        .homeGroup(ing)
                        .awayGroup(med)
                        .homeScore(null)
                        .awayScore(null)
                        .organizer("Oficina de Bienestar Universitario")
                        .status(BookingStatus.SCHEDULED)
                        .build();
                bookingRepository.save(match);
                System.out.println("Seeded initial university match");
            }
        }
    }
}
