package com.smart.attendance.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "sessions")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({ "teacher" })
    private Course course;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "qr_secret", nullable = false)
    @JsonIgnore
    private String qrSecret;

    @Column(name = "current_qr_token")
    @JsonIgnore
    private String currentQrToken;

    @Column(name = "current_qr_expires_at")
    @JsonIgnore
    private LocalDateTime currentQrExpiresAt;

    @Column(name = "previous_qr_token")
    @JsonIgnore
    private String previousQrToken;

    @Column(name = "previous_qr_grace_until")
    @JsonIgnore
    private LocalDateTime previousQrGraceUntil;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
