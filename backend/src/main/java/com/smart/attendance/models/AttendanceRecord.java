package com.smart.attendance.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance_records")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnoreProperties({ "qrSecret" })
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({ "devices", "passwordHash" })
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    @JsonIgnoreProperties({ "user" })
    private Device device;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @Column(name = "confidence_score")
    private Integer confidenceScore;

    @Column(name = "distance_meters")
    private Double distanceMeters;

    @Column(name = "override_reason")
    private String overrideReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overridden_by")
    @JsonIgnoreProperties({ "devices", "passwordHash" })
    private User overriddenBy;

    @Column(name = "overridden_at")
    private LocalDateTime overriddenAt;
}
