package com.smart.attendance.services;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public final class TeacherIdentity {

    private static final Set<String> NON_PERSON_ENTRIES = Set.of("training cell");

    private TeacherIdentity() {
    }

    public static List<String> extractTeacherNames(String teacherDisplayName) {
        if (teacherDisplayName == null || teacherDisplayName.isBlank()) {
            return List.of();
        }

        String normalized = teacherDisplayName
                .replace('\u00A0', ' ')
                .replaceAll("(?i)\\([^)]*\\)", " ")
                .replaceAll("(?i)\\band\\b", "&")
                .replaceAll("\\s+", " ")
                .trim();

        if (normalized.isBlank() || NON_PERSON_ENTRIES.contains(normalized.toLowerCase(Locale.ROOT))) {
            return List.of();
        }

        return Arrays.stream(normalized.split("\\s*(?:&|/|,)\\s*"))
                .map(String::trim)
                .map(part -> part.replaceAll("\\s+", " ").trim())
                .filter(part -> !part.isBlank())
                .filter(part -> !NON_PERSON_ENTRIES.contains(part.toLowerCase(Locale.ROOT)))
                .collect(Collectors.collectingAndThen(Collectors.toCollection(LinkedHashSet::new), List::copyOf));
    }

    public static String buildTeacherEmail(String teacherName) {
        String localPart = normalizeTeacherKey(teacherName).replace(" ", "");
        if (localPart.isBlank()) {
            localPart = "teacher";
        }
        return localPart + "@gmail.com";
    }

    public static String buildTeacherPassword(String teacherName) {
        List<String> tokens = Arrays.stream(normalizeTeacherKey(teacherName).split(" "))
                .filter(token -> !token.isBlank())
                .toList();

        if (tokens.isEmpty()) {
            return "teacher@123";
        }

        String preferredToken = tokens.stream()
                .filter(token -> token.length() > 1)
                .findFirst()
                .orElse(tokens.get(0));

        return preferredToken + "@123";
    }

    public static String buildDisplayAccountEmail(String teacherDisplayName) {
        String localPart = teacherDisplayName.toLowerCase(Locale.ROOT)
                .replace("&", " and ")
                .replaceAll("[^a-z0-9]+", ".")
                .replaceAll("\\.+", ".")
                .replaceAll("^\\.|\\.$", "");

        if (localPart.isBlank()) {
            localPart = "teacher";
        }

        return localPart + "@faculty.smart.edu";
    }

    public static String normalizeTeacherKey(String teacherName) {
        if (teacherName == null || teacherName.isBlank()) {
            return "";
        }

        return teacherName.toLowerCase(Locale.ROOT)
                .replaceAll("(?i)\\([^)]*\\)", " ")
                .replaceAll("(?i)\\b(dr|mr|mrs|ms|prof|professor)\\.?\\s*", " ")
                .replaceAll("[^a-z0-9]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
