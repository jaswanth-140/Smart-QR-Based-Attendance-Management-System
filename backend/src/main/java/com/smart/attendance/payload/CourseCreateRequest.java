package com.smart.attendance.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CourseCreateRequest {

    @NotBlank(message = "Course code is required")
    @Size(max = 30, message = "Course code is too long")
    private String code;

    @NotBlank(message = "Course name is required")
    @Size(max = 150, message = "Course name is too long")
    private String name;

    @Size(max = 120, message = "Schedule is too long")
    private String schedule;

    @NotNull(message = "Teacher id is required")
    private Long teacherId;
}
