package com.smart.attendance.services;

import com.smart.attendance.models.Course;
import com.smart.attendance.models.Role;
import com.smart.attendance.models.User;

import java.util.Locale;

public final class TeacherCourseAccessPolicy {

    private TeacherCourseAccessPolicy() {
    }

    public static boolean canActorAccessCourse(User actor, Course course) {
        if (actor == null || course == null || actor.getRole() == null) {
            return false;
        }

        if (actor.getRole() == Role.ADMIN) {
            return true;
        }

        if (actor.getRole() != Role.TEACHER) {
            return false;
        }

        User assignedTeacher = course.getTeacher();
        if (assignedTeacher != null && assignedTeacher.getId() != null && assignedTeacher.getId().equals(actor.getId())) {
            return true;
        }

        if (assignedTeacher == null || assignedTeacher.getName() == null || actor.getEmail() == null) {
            return false;
        }

        String actorEmail = actor.getEmail().toLowerCase(Locale.ROOT);
        for (String teacherName : TeacherIdentity.extractTeacherNames(assignedTeacher.getName())) {
            if (TeacherIdentity.buildTeacherEmail(teacherName).equalsIgnoreCase(actorEmail)) {
                return true;
            }
        }

        return false;
    }
}
