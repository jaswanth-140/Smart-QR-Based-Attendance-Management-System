package com.smart.attendance.services;

import com.smart.attendance.models.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CseSectionAllocatorTest {

    private final CseSectionAllocator allocator = new CseSectionAllocator();

    @Test
    void resolvesAidsStudentsIntoSingleSharedSection() {
        User student = User.builder()
                .studentId("2410080042")
                .department("AI&DS")
                .build();

        assertEquals("AI&DS", allocator.resolveSection(student));
        assertEquals("AIDS", allocator.resolveCourseCodePrefix(student));
        assertTrue(allocator.matchesCourseSection(student, "AIDS-AI&DS-FSAD"));
    }

    @Test
    void resolvesEceStudentsIntoBalancedRandomSections() {
        User student = User.builder()
                .studentId("2410040042")
                .department("ECE")
                .build();

        String section = allocator.resolveSection(student);
        assertNotNull(section);
        assertTrue(section.equals("S1") || section.equals("S2"));
        assertEquals("ECE", allocator.resolveCourseCodePrefix(student));
        assertTrue(allocator.matchesCourseSection(student, "ECE-" + section + "-VLSI"));
    }
}
