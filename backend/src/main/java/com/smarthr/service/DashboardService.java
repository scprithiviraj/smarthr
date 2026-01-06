package com.smarthr.service;

import com.smarthr.entity.Attendance;
import com.smarthr.entity.AttendanceStatus;
import com.smarthr.entity.LeaveStatus;
import com.smarthr.entity.User;
import com.smarthr.payload.response.DashboardStatsResponse;
import com.smarthr.repository.AttendanceRepository;
import com.smarthr.repository.LeaveRequestRepository;
import com.smarthr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class DashboardService {

        @Autowired
        private AttendanceRepository attendanceRepository;

        @Autowired
        private LeaveRequestRepository leaveRequestRepository;

        @Autowired
        private UserRepository userRepository;

        public DashboardStatsResponse getUserStats(Long userId) {
                User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
                LocalDate now = LocalDate.now();
                LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
                LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

                // 1. Total Working Days (Business Days in Month)
                long totalWorkingDays = IntStream.rangeClosed(1, now.lengthOfMonth())
                                .mapToObj(day -> LocalDate.of(now.getYear(), now.getMonth(), day))
                                .filter(date -> date.getDayOfWeek() != DayOfWeek.SATURDAY
                                                && date.getDayOfWeek() != DayOfWeek.SUNDAY)
                                .count();

                // 2. Present Days (Count of PRESENT status in this month)
                long presentDays = attendanceRepository.countByUserAndStatusAndDateBetween(
                                user, AttendanceStatus.PRESENT, startOfMonth, endOfMonth);

                // 3. Pending Leaves
                long pendingLeaves = leaveRequestRepository.countByUserAndStatus(user, LeaveStatus.PENDING);

                // 4. Attendance Status Pie Chart
                Map<String, Long> statusCounts = new HashMap<>();
                statusCounts.put("PRESENT", presentDays);
                statusCounts.put("ABSENT", attendanceRepository.countByUserAndStatusAndDateBetween(user,
                                AttendanceStatus.ABSENT, startOfMonth, endOfMonth));
                statusCounts.put("HALF_DAY", attendanceRepository.countByUserAndStatusAndDateBetween(user,
                                AttendanceStatus.HALF_DAY, startOfMonth, endOfMonth));
                // Count Approved leaves for "Leave" slice
                statusCounts.put("LEAVE", leaveRequestRepository.findByUser(user).stream()
                                .filter(l -> l.getStatus() == LeaveStatus.APPROVED &&
                                                !l.getStartDate().isAfter(endOfMonth)
                                                && !l.getEndDate().isBefore(startOfMonth))
                                .count()); // Simple overlap check

                // 5. Weekly Working Hours
                LocalDate startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                LocalDate endOfWeek = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.FRIDAY));
                List<Attendance> weeklyAttendance = attendanceRepository.findByUserAndDateBetween(user, startOfWeek,
                                endOfWeek);

                Map<String, Double> weeklyHours = new HashMap<>();
                // Initialize with 0
                weeklyHours.put("Mon", 0.0);
                weeklyHours.put("Tue", 0.0);
                weeklyHours.put("Wed", 0.0);
                weeklyHours.put("Thu", 0.0);
                weeklyHours.put("Fri", 0.0);

                for (Attendance att : weeklyAttendance) {
                        String dayName = att.getDate().getDayOfWeek().name().substring(0, 3); // MON, TUE...
                        dayName = dayName.charAt(0) + dayName.substring(1).toLowerCase(); // Mon, Tue...
                        if (weeklyHours.containsKey(dayName)) {
                                // Assuming Attendance has getWorkingHours() which returns Double or something
                                // similar.
                                // If it doesn't exist, we might need to calculate from checkIn/checkOut or mock
                                // it.
                                // Let's check Attendance entity first. For now, assuming standard 8 if present,
                                // or existing field.
                                Double hours = att.getTotalHours() != null ? att.getTotalHours() : 0.0;
                                weeklyHours.put(dayName, hours);
                        }
                }

                // 6. Last 6 Months Attendance Trend
                Map<String, Long> lastSixMonthsAttendance = new HashMap<>();
                for (int i = 0; i < 6; i++) {
                        LocalDate monthDate = now.minusMonths(i);
                        LocalDate start = monthDate.with(TemporalAdjusters.firstDayOfMonth());
                        LocalDate end = monthDate.with(TemporalAdjusters.lastDayOfMonth());
                        long count = attendanceRepository.countByUserAndStatusAndDateBetween(user,
                                        AttendanceStatus.PRESENT, start,
                                        end);
                        lastSixMonthsAttendance.put(monthDate.getMonth().name(), count);
                }

                // 7. Activity Feed (Mocking slightly for now as we don't have an Activity Log
                // table,
                // using latest attendance checks and leave requests)
                List<Map<String, Object>> activityFeed = new java.util.ArrayList<>();
                // Add latest attendance
                List<Attendance> recentAttendance = attendanceRepository.findByUser(user);
                recentAttendance.stream()
                                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                                .limit(3)
                                .forEach(att -> {
                                        Map<String, Object> log = new HashMap<>();
                                        log.put("type", "ATTENDANCE");
                                        log.put("message", "Marked " + att.getStatus() + " on " + att.getDate());
                                        log.put("date", att.getDate().toString());
                                        activityFeed.add(log);
                                });
                // Add latest leaves
                leaveRequestRepository.findByUser(user).stream()
                                .sorted((a, b) -> b.getId().compareTo(a.getId())) // assuming higher ID is newer
                                .limit(2)
                                .forEach(leave -> {
                                        Map<String, Object> log = new HashMap<>();
                                        log.put("type", "LEAVE");
                                        log.put("message", "Leave request (" + leave.getLeaveType() + ") is "
                                                        + leave.getStatus());
                                        log.put("date", leave.getStartDate().toString());
                                        activityFeed.add(log);
                                });

                // Calculate Total Working Hours for the Month
                Double totalWorkingHours = attendanceRepository.findByUserAndDateBetween(user, startOfMonth, endOfMonth)
                                .stream()
                                .mapToDouble(a -> a.getTotalHours() != null ? a.getTotalHours() : 0.0)
                                .sum();

                // 8. Leave Distribution (By Type, for this year)
                // Filter approved leaves for the current year
                Map<String, Long> leaveDistribution = leaveRequestRepository.findByUser(user).stream()
                                .filter(l -> l.getStatus() == LeaveStatus.APPROVED &&
                                                l.getStartDate().getYear() == now.getYear())
                                .collect(Collectors.groupingBy(com.smarthr.entity.LeaveRequest::getLeaveType,
                                                Collectors.counting()));

                // 9. Total Leaves
                long totalLeaves = leaveDistribution.values().stream().mapToLong(Long::longValue).sum();

                return new DashboardStatsResponse(
                                totalWorkingDays,
                                presentDays,
                                pendingLeaves,
                                0, // Total Employees (not relevant for user)
                                statusCounts,
                                weeklyHours,
                                activityFeed,
                                lastSixMonthsAttendance,
                                totalWorkingHours,
                                leaveDistribution,
                                totalLeaves);
        }

        // Admin Stats
        public DashboardStatsResponse getAdminStats() {
                LocalDate now = LocalDate.now();
                LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
                LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

                // 1. Total Employees
                long totalEmployees = userRepository.count();

                // 2. Count Present Employees Today
                long presentToday = attendanceRepository.countByStatusAndDate(AttendanceStatus.PRESENT, now);

                // 3. Pending Leaves (System Wide)
                long pendingLeaves = leaveRequestRepository.countByStatus(LeaveStatus.PENDING);

                // 4. Attendance Status Pie Chart (System Wide for Month)
                Map<String, Long> statusCounts = new HashMap<>();
                statusCounts.put("PRESENT", attendanceRepository.countByStatusAndDateBetween(AttendanceStatus.PRESENT,
                                startOfMonth, endOfMonth));
                statusCounts.put("ABSENT", attendanceRepository.countByStatusAndDateBetween(AttendanceStatus.ABSENT,
                                startOfMonth, endOfMonth));
                statusCounts.put("HALF_DAY", attendanceRepository.countByStatusAndDateBetween(AttendanceStatus.HALF_DAY,
                                startOfMonth, endOfMonth));
                statusCounts.put("LEAVE", leaveRequestRepository.findByStatus(LeaveStatus.APPROVED).stream()
                                .filter(l -> !l.getStartDate().isAfter(endOfMonth)
                                                && !l.getEndDate().isBefore(startOfMonth))
                                .count());

                // 5. Weekly Working Hours (Not applicable for Admin view really, maybe Avg?
                // Skipping for now or mocking 0)
                Map<String, Double> weeklyHours = new HashMap<>(); // Empty for admin

                // 6. Last 6 Months Attendance Trend (System Wide)
                Map<String, Long> lastSixMonthsAttendance = new HashMap<>();
                for (int i = 0; i < 6; i++) {
                        LocalDate monthDate = now.minusMonths(i);
                        LocalDate start = monthDate.with(TemporalAdjusters.firstDayOfMonth());
                        LocalDate end = monthDate.with(TemporalAdjusters.lastDayOfMonth());
                        long count = attendanceRepository.countByStatusAndDateBetween(AttendanceStatus.PRESENT, start,
                                        end);
                        lastSixMonthsAttendance.put(monthDate.getMonth().name(), count);
                }

                // 7. Activity Feed (Latest System Activity)
                List<Map<String, Object>> activityFeed = new java.util.ArrayList<>();
                // Latest leave requests
                leaveRequestRepository.findAll().stream()
                                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                                .limit(5)
                                .forEach(leave -> {
                                        Map<String, Object> log = new HashMap<>();
                                        log.put("type", "LEAVE");
                                        log.put("message", leave.getUser().getFullName() + " applied for leave ("
                                                        + leave.getLeaveType() + ")");
                                        log.put("date", leave.getAppliedAt().toString());
                                        activityFeed.add(log);
                                });

                // 8. Leave Distribution (System Wide, for this year)
                Map<String, Long> leaveDistribution = leaveRequestRepository.findAll().stream()
                                .filter(l -> l.getStatus() == LeaveStatus.APPROVED &&
                                                l.getStartDate().getYear() == now.getYear())
                                .collect(Collectors.groupingBy(com.smarthr.entity.LeaveRequest::getLeaveType,
                                                Collectors.counting()));

                // 9. Total Leaves (System Wide)
                long totalLeaves = leaveDistribution.values().stream().mapToLong(Long::longValue).sum();

                return new DashboardStatsResponse(
                                0, // working days (not needed for admin summary really)
                                presentToday, // reusing this field for "On Leave Today" or similar in frontend mapping?
                                              // NO, let's map it to Present Today
                                pendingLeaves,
                                totalEmployees,
                                statusCounts,
                                weeklyHours,
                                activityFeed,
                                lastSixMonthsAttendance,
                                0.0,
                                leaveDistribution,
                                totalLeaves);
        }
}
