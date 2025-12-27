package com.smarthr.controller;

import com.smarthr.service.ReportService;
import com.smarthr.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.io.ByteArrayInputStream;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {

        @Autowired
        private ReportService reportService;

        @GetMapping("/attendance")
        public ResponseEntity<InputStreamResource> generateAttendanceReport(
                        @RequestParam int month,
                        @RequestParam int year) {

                UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();

                ByteArrayInputStream bis = reportService.generateAttendanceReport(userDetails.getId(), month, year);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=attendance_report.pdf");

                return ResponseEntity
                                .ok()
                                .headers(headers)
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(new InputStreamResource(bis));
        }

        @GetMapping("/leave")
        public ResponseEntity<InputStreamResource> generateLeaveReport(
                        @RequestParam int month,
                        @RequestParam int year) {

                UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();

                ByteArrayInputStream bis = reportService.generateLeaveReport(userDetails.getId(), month, year);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=leave_report.pdf");

                return ResponseEntity
                                .ok()
                                .headers(headers)
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(new InputStreamResource(bis));
        }

        @GetMapping("/admin/attendance")
        @PreAuthorize("hasAuthority('ADMIN')")
        public ResponseEntity<InputStreamResource> generateAllAttendanceReport(
                        @RequestParam int month,
                        @RequestParam int year) {

                ByteArrayInputStream bis = reportService.generateAllAttendanceReport(month, year);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=all_attendance_report.pdf");

                return ResponseEntity
                                .ok()
                                .headers(headers)
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(new InputStreamResource(bis));
        }

        @GetMapping("/admin/leave")
        @PreAuthorize("hasAuthority('ADMIN')")
        public ResponseEntity<InputStreamResource> generateAllLeaveReport(
                        @RequestParam int month,
                        @RequestParam int year) {

                ByteArrayInputStream bis = reportService.generateAllLeaveReport(month, year);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=all_leave_report.pdf");

                return ResponseEntity
                                .ok()
                                .headers(headers)
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(new InputStreamResource(bis));
        }

        @GetMapping("/payroll")
        @PreAuthorize("hasAuthority('ADMIN')")
        public ResponseEntity<InputStreamResource> generatePayrollReport(
                        @RequestParam int month,
                        @RequestParam int year) {

                ByteArrayInputStream bis = reportService.generatePayrollReport(month, year);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=payroll_report.pdf");

                return ResponseEntity
                                .ok()
                                .headers(headers)
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(new InputStreamResource(bis));
        }

        @GetMapping("/late-in")
        @PreAuthorize("hasAuthority('ADMIN')")
        public ResponseEntity<InputStreamResource> generateLateInReport(
                        @RequestParam int month,
                        @RequestParam int year) {

                ByteArrayInputStream bis = reportService.generateLateInReport(month, year);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=late_in_report.pdf");

                return ResponseEntity
                                .ok()
                                .headers(headers)
                                .contentType(MediaType.APPLICATION_PDF)
                                .body(new InputStreamResource(bis));
        }
}
