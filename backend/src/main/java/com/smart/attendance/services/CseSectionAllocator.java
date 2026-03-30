package com.smart.attendance.services;

import com.smart.attendance.models.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Service
public class CseSectionAllocator {

    private static final String CSE_DEPARTMENT = "CSE";
    private static final String ECE_DEPARTMENT = "ECE";
    private static final String AIDS_DEPARTMENT = "AI&DS";
    private static final String ECE_COURSE_PREFIX = "ECE";
    private static final String AIDS_COURSE_PREFIX = "AIDS";
    private static final List<String> ECE_SECTIONS = List.of("S1", "S2");
    private static final String AIDS_SECTION = "AI&DS";
    private static final List<String> BALANCED_SECTIONS = List.of("A1", "A2", "A3", "A5", "A6");
    private static final long SECTION_SHUFFLE_SEED = 20260329L;
    private static final long ECE_SECTION_SHUFFLE_SEED = 20260330L;

    private static final Set<String> A4_FIXED_STUDENT_IDS = Set.of(
            "2410030026", "2410030031", "2410030032", "2410030069", "2410030071", "2410030074",
            "2410030088", "2410030098", "2410030101", "2410030107", "2410030140", "2410030146",
            "2410030169", "2410030171", "2410030175", "2410030201", "2410030205", "2410030212",
            "2410030231", "2410030264", "2410030270", "2410030300", "2410030307", "2410030310",
            "2410030311", "2410030314", "2410030315", "2410030325", "2410030326", "2410030335",
            "2410030337", "2410030339", "2410030341", "2410030388", "2410030398", "2410030399",
            "2410030400", "2410030401", "2410030412", "2410030423", "2410030424", "2410030442",
            "2410030446", "2410030449", "2410030454", "2410030460", "2410030467", "2410030477",
            "2410030506", "2410030508", "2410030512", "2410030522");

    public Map<String, List<User>> assignStudentsToSections(List<User> cseStudents) {
        Map<String, List<User>> result = new LinkedHashMap<>();
        result.put("A4", new ArrayList<>());
        for (String section : BALANCED_SECTIONS) {
            result.put(section, new ArrayList<>());
        }

        List<User> remaining = new ArrayList<>();
        for (User student : cseStudents) {
            if (A4_FIXED_STUDENT_IDS.contains(student.getStudentId())) {
                result.get("A4").add(student);
            } else {
                remaining.add(student);
            }
        }

        remaining.sort(Comparator.comparing(User::getStudentId));
        Collections.shuffle(remaining, new Random(SECTION_SHUFFLE_SEED));

        for (int index = 0; index < remaining.size(); index++) {
            String section = BALANCED_SECTIONS.get(index % BALANCED_SECTIONS.size());
            result.get(section).add(remaining.get(index));
        }

        return result;
    }

    public String resolveSection(User student) {
        if (student == null || student.getDepartment() == null) {
            return null;
        }

        if (AIDS_DEPARTMENT.equals(student.getDepartment())) {
            return AIDS_SECTION;
        }

        if (student.getStudentId() == null) {
            return null;
        }

        if (ECE_DEPARTMENT.equals(student.getDepartment())) {
            return resolveEceSection(student.getStudentId());
        }

        if (!CSE_DEPARTMENT.equals(student.getDepartment())) {
            return null;
        }

        if (A4_FIXED_STUDENT_IDS.contains(student.getStudentId())) {
            return "A4";
        }

        Integer serial = parseStudentSerial(student.getStudentId(), "241003");
        if (serial == null) {
            return null;
        }
        List<Integer> serials = new ArrayList<>();
        for (int current = 1; current <= 533; current++) {
            String currentStudentId = String.format("241003%04d", current);
            if (!A4_FIXED_STUDENT_IDS.contains(currentStudentId)) {
                serials.add(current);
            }
        }

        Collections.shuffle(serials, new Random(SECTION_SHUFFLE_SEED));
        int position = serials.indexOf(serial);
        if (position < 0) {
            return null;
        }

        return BALANCED_SECTIONS.get(position % BALANCED_SECTIONS.size());
    }

    public String resolveCourseCodePrefix(User student) {
        if (student == null || student.getDepartment() == null) {
            return null;
        }

        if (CSE_DEPARTMENT.equals(student.getDepartment())) {
            return CSE_DEPARTMENT;
        }

        if (ECE_DEPARTMENT.equals(student.getDepartment())) {
            return ECE_COURSE_PREFIX;
        }

        if (AIDS_DEPARTMENT.equals(student.getDepartment())) {
            return AIDS_COURSE_PREFIX;
        }

        return null;
    }

    public String resolveDepartmentFromCourseCode(String courseCode) {
        if (courseCode == null || courseCode.isBlank()) {
            return null;
        }

        String[] parts = courseCode.split("-");
        if (parts.length < 3) {
            return null;
        }

        return switch (parts[0].toUpperCase()) {
            case CSE_DEPARTMENT -> CSE_DEPARTMENT;
            case ECE_COURSE_PREFIX -> ECE_DEPARTMENT;
            case AIDS_COURSE_PREFIX -> AIDS_DEPARTMENT;
            default -> null;
        };
    }

    public boolean matchesCourseSection(User student, String courseCode) {
        if (student == null || courseCode == null) {
            return false;
        }

        String[] parts = courseCode.split("-");
        if (parts.length < 3) {
            return false;
        }

        String courseDepartment = resolveDepartmentFromCourseCode(courseCode);
        String studentSection = resolveSection(student);
        return courseDepartment != null
                && courseDepartment.equals(student.getDepartment())
                && studentSection != null
                && parts[1].equalsIgnoreCase(studentSection);
    }

    private String resolveEceSection(String studentId) {
        Integer serial = parseStudentSerial(studentId, "241004");
        if (serial == null) {
            return null;
        }
        List<Integer> serials = new ArrayList<>();
        for (int current = 1; current <= 143; current++) {
            serials.add(current);
        }

        Collections.shuffle(serials, new Random(ECE_SECTION_SHUFFLE_SEED));
        int position = serials.indexOf(serial);
        if (position < 0) {
            return null;
        }

        return ECE_SECTIONS.get(position % ECE_SECTIONS.size());
    }

    private Integer parseStudentSerial(String studentId, String expectedPrefix) {
        if (studentId == null || expectedPrefix == null || !studentId.startsWith(expectedPrefix) || studentId.length() != 10) {
            return null;
        }

        String serialPart = studentId.substring(expectedPrefix.length());
        for (int index = 0; index < serialPart.length(); index++) {
            if (!Character.isDigit(serialPart.charAt(index))) {
                return null;
            }
        }

        return Integer.parseInt(serialPart);
    }
}
