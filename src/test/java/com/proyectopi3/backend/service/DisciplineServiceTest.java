package com.proyectopi3.backend.service;

import com.proyectopi3.backend.dto.DisciplineRequest;
import com.proyectopi3.backend.model.Discipline;
import com.proyectopi3.backend.repository.DisciplineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DisciplineServiceTest {

    @Mock
    private DisciplineRepository repository;

    @InjectMocks
    private DisciplineService service;

    @Test
    void getAll_ReturnsList() {
        Discipline d1 = new Discipline(1L, "Football", "11v11 match");
        Discipline d2 = new Discipline(2L, "Basketball", "5v5 match");
        when(repository.findAll()).thenReturn(Arrays.asList(d1, d2));

        List<Discipline> result = service.getAll();

        assertEquals(2, result.size());
        assertEquals("Football", result.get(0).getName());
        assertEquals("Basketball", result.get(1).getName());
    }

    @Test
    void getById_Found() {
        Discipline discipline = new Discipline(1L, "Football", "11v11 match");
        when(repository.findById(1L)).thenReturn(Optional.of(discipline));

        Optional<Discipline> result = service.getById(1L);

        assertTrue(result.isPresent());
        assertEquals("Football", result.get().getName());
    }

    @Test
    void getById_NotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        Optional<Discipline> result = service.getById(99L);

        assertFalse(result.isPresent());
    }

    @Test
    void create_Success() {
        DisciplineRequest request = new DisciplineRequest();
        request.setName("Tennis");
        request.setDescription("1v1 match");

        when(repository.existsByNameIgnoreCase("Tennis")).thenReturn(false);
        Discipline savedDiscipline = new Discipline(1L, "Tennis", "1v1 match");
        when(repository.save(any(Discipline.class))).thenReturn(savedDiscipline);

        Discipline result = service.create(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Tennis", result.getName());
        verify(repository, times(1)).save(any(Discipline.class));
    }

    @Test
    void create_DuplicateName_ThrowsException() {
        DisciplineRequest request = new DisciplineRequest();
        request.setName("Tennis");
        request.setDescription("1v1 match");

        when(repository.existsByNameIgnoreCase("Tennis")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> service.create(request));
        verify(repository, never()).save(any(Discipline.class));
    }

    @Test
    void update_Success() {
        DisciplineRequest request = new DisciplineRequest();
        request.setName("New Football");
        request.setDescription("Updated description");

        Discipline existing = new Discipline(1L, "Football", "11v11 match");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.existsByNameIgnoreCase("New Football")).thenReturn(false);

        Discipline updated = new Discipline(1L, "New Football", "Updated description");
        when(repository.save(any(Discipline.class))).thenReturn(updated);

        Optional<Discipline> result = service.update(1L, request);

        assertTrue(result.isPresent());
        assertEquals("New Football", result.get().getName());
        assertEquals("Updated description", result.get().getDescription());
    }

    @Test
    void update_NotFound() {
        DisciplineRequest request = new DisciplineRequest();
        request.setName("New Football");
        request.setDescription("Updated description");

        when(repository.findById(99L)).thenReturn(Optional.empty());

        Optional<Discipline> result = service.update(99L, request);

        assertFalse(result.isPresent());
        verify(repository, never()).save(any(Discipline.class));
    }

    @Test
    void delete_Success() {
        when(repository.existsById(1L)).thenReturn(true);

        boolean result = service.delete(1L);

        assertTrue(result);
        verify(repository, times(1)).deleteById(1L);
    }

    @Test
    void delete_NotFound() {
        when(repository.existsById(99L)).thenReturn(false);

        boolean result = service.delete(99L);

        assertFalse(result);
        verify(repository, never()).deleteById(99L);
    }
}
