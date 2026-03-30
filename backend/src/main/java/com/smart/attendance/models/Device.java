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
@Table(name = "devices")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "devices", "passwordHash" })
    private User user;

    @Column(name = "hardware_identifier", nullable = false, unique = true)
    private String hardwareIdentifier;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "is_current", nullable = false)
    @Builder.Default
    private boolean isCurrent = false;
}
