package com.smart.attendance.repositories;

import com.smart.attendance.models.Device;
import com.smart.attendance.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    List<Device> findByUser(User user);

    Optional<Device> findByHardwareIdentifier(String hardwareIdentifier);

    int countByUser(User user);
}
