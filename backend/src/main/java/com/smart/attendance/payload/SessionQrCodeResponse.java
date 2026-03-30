package com.smart.attendance.payload;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SessionQrCodeResponse {
    private Long sessionId;
    private String qrToken;
    private LocalDateTime expiresAt;
    private int refreshIntervalSeconds;
}
