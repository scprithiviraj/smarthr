package com.smarthr.payload.response;

import java.util.Map;
import java.util.List;

public class DashboardStatsResponse {
    private long totalWorkingDays; // e.g., 22 (Business days in month)
    private long presentDays; // e.g., 18
    private long pendingLeaves; // e.g., 1
    private long totalEmployees; // Admin only

    private Map<String, Long> attendanceStatusCounts; // Present, Absent, Leave, etc.
    private Map<String, Double> weeklyWorkingHours; // Mon: 8.0, Tue: 8.5
    private List<Map<String, Object>> activityFeed; // Recent actions
    private Map<String, Long> lastSixMonthsAttendance;// Month -> Present Count
    private Double totalWorkingHours; // Total hours worked this month
    private Map<String, Long> leaveDistribution; // Breakdown by type (Sick, Casual, etc.)
    private long totalLeaves; // Sum of all approved leaves this year

    // Constructors, Getters, Setters
    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalWorkingDays, long presentDays, long pendingLeaves, long totalEmployees,
            Map<String, Long> attendanceStatusCounts, Map<String, Double> weeklyWorkingHours,
            List<Map<String, Object>> activityFeed, Map<String, Long> lastSixMonthsAttendance,
            Double totalWorkingHours, Map<String, Long> leaveDistribution, long totalLeaves) {
        this.totalWorkingDays = totalWorkingDays;
        this.presentDays = presentDays;
        this.pendingLeaves = pendingLeaves;
        this.totalEmployees = totalEmployees;
        this.attendanceStatusCounts = attendanceStatusCounts;
        this.weeklyWorkingHours = weeklyWorkingHours;
        this.activityFeed = activityFeed;
        this.lastSixMonthsAttendance = lastSixMonthsAttendance;
        this.totalWorkingHours = totalWorkingHours;
        this.leaveDistribution = leaveDistribution;
        this.totalLeaves = totalLeaves;
    }

    public long getTotalLeaves() {
        return totalLeaves;
    }

    public void setTotalLeaves(long totalLeaves) {
        this.totalLeaves = totalLeaves;
    }

    public List<Map<String, Object>> getActivityFeed() {
        return activityFeed;
    }

    public void setActivityFeed(List<Map<String, Object>> activityFeed) {
        this.activityFeed = activityFeed;
    }

    public Map<String, Long> getLastSixMonthsAttendance() {
        return lastSixMonthsAttendance;
    }

    public void setLastSixMonthsAttendance(Map<String, Long> lastSixMonthsAttendance) {
        this.lastSixMonthsAttendance = lastSixMonthsAttendance;
    }

    public long getTotalWorkingDays() {
        return totalWorkingDays;
    }

    public void setTotalWorkingDays(long totalWorkingDays) {
        this.totalWorkingDays = totalWorkingDays;
    }

    public long getPresentDays() {
        return presentDays;
    }

    public void setPresentDays(long presentDays) {
        this.presentDays = presentDays;
    }

    public long getPendingLeaves() {
        return pendingLeaves;
    }

    public void setPendingLeaves(long pendingLeaves) {
        this.pendingLeaves = pendingLeaves;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public Map<String, Long> getAttendanceStatusCounts() {
        return attendanceStatusCounts;
    }

    public void setAttendanceStatusCounts(Map<String, Long> attendanceStatusCounts) {
        this.attendanceStatusCounts = attendanceStatusCounts;
    }

    public Map<String, Double> getWeeklyWorkingHours() {
        return weeklyWorkingHours;
    }

    public void setWeeklyWorkingHours(Map<String, Double> weeklyWorkingHours) {
        this.weeklyWorkingHours = weeklyWorkingHours;
    }

    public Double getTotalWorkingHours() {
        return totalWorkingHours;
    }

    public void setTotalWorkingHours(Double totalWorkingHours) {
        this.totalWorkingHours = totalWorkingHours;
    }

    public Map<String, Long> getLeaveDistribution() {
        return leaveDistribution;
    }

    public void setLeaveDistribution(Map<String, Long> leaveDistribution) {
        this.leaveDistribution = leaveDistribution;
    }
}
