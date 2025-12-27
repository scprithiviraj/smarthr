package com.smarthr.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.smarthr.entity.Attendance;
import com.smarthr.entity.LeaveRequest;
import com.smarthr.entity.User;
import com.smarthr.repository.AttendanceRepository;
import com.smarthr.repository.LeaveRequestRepository;
import com.smarthr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Stream;

@Service
public class ReportService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    public ByteArrayInputStream generateAttendanceReport(Long userId, int month, int year) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            User user = userRepository.findById(userId).orElseThrow();

            // Title
            Font font = FontFactory.getFont(FontFactory.COURIER, 14, BaseColor.BLACK);
            Paragraph para = new Paragraph("Attendance Report - " + month + "/" + year, font);
            para.setAlignment(Element.ALIGN_CENTER);
            document.add(para);
            document.add(Chunk.NEWLINE);

            // User Info
            document.add(new Paragraph("Employee: " + user.getFullName()));
            document.add(new Paragraph("Role: " + user.getRole()));
            document.add(Chunk.NEWLINE);

            // Table
            PdfPTable table = new PdfPTable(4);
            Stream.of("Date", "Status", "Check In", "Check Out")
                    .forEach(headerTitle -> {
                        PdfPCell header = new PdfPCell();
                        header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        header.setBorderWidth(1);
                        header.setPhrase(new Phrase(headerTitle));
                        table.addCell(header);
                    });

            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

            List<Attendance> logs = attendanceRepository.findByUserAndDateBetween(user, startDate, endDate);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            for (Attendance log : logs) {
                table.addCell(log.getDate().format(dateFormatter));
                table.addCell(log.getStatus().toString());
                table.addCell(log.getClockInTime() != null ? log.getClockInTime().format(timeFormatter) : "-");
                table.addCell(log.getClockOutTime() != null ? log.getClockOutTime().format(timeFormatter) : "-");
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateLeaveReport(Long userId, int month, int year) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            User user = userRepository.findById(userId).orElseThrow();

            // Title
            Font font = FontFactory.getFont(FontFactory.COURIER, 14, BaseColor.BLACK);
            Paragraph para = new Paragraph("Leave Report - " + month + "/" + year, font);
            para.setAlignment(Element.ALIGN_CENTER);
            document.add(para);
            document.add(Chunk.NEWLINE);

            // User Info
            document.add(new Paragraph("Employee: " + user.getFullName()));
            document.add(new Paragraph("Role: " + user.getRole()));
            document.add(Chunk.NEWLINE);

            // Table
            PdfPTable table = new PdfPTable(5);
            Stream.of("Type", "From", "To", "Days", "Status")
                    .forEach(headerTitle -> {
                        PdfPCell header = new PdfPCell();
                        header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        header.setBorderWidth(1);
                        header.setPhrase(new Phrase(headerTitle));
                        table.addCell(header);
                    });

            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

            List<com.smarthr.entity.LeaveRequest> leaves = leaveRequestRepository.findByUserAndStartDateBetween(user,
                    startDate, endDate);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            for (com.smarthr.entity.LeaveRequest leave : leaves) {
                table.addCell(leave.getLeaveType());
                table.addCell(leave.getStartDate().format(dateFormatter));
                table.addCell(leave.getEndDate().format(dateFormatter));
                table.addCell(String.valueOf(leave.getDays()));
                table.addCell(leave.getStatus().toString());
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateAllAttendanceReport(int month, int year) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.COURIER, 14, BaseColor.BLACK);
            Paragraph para = new Paragraph("Organization Attendance Report - " + month + "/" + year, titleFont);
            para.setAlignment(Element.ALIGN_CENTER);
            document.add(para);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            Stream.of("Employee", "Date", "Status", "Check In", "Check Out")
                    .forEach(headerTitle -> {
                        PdfPCell header = new PdfPCell();
                        header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        header.setBorderWidth(1);
                        header.setPhrase(new Phrase(headerTitle));
                        table.addCell(header);
                    });

            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

            List<Attendance> logs = attendanceRepository.findByDateBetween(startDate, endDate);
            // Sort by Date then User
            logs.sort((a, b) -> {
                int dateCompare = a.getDate().compareTo(b.getDate());
                if (dateCompare != 0)
                    return dateCompare;
                return a.getUser().getFullName().compareTo(b.getUser().getFullName());
            });

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            for (Attendance log : logs) {
                table.addCell(log.getUser().getFullName());
                table.addCell(log.getDate().format(dateFormatter));
                table.addCell(log.getStatus().toString());
                table.addCell(log.getClockInTime() != null ? log.getClockInTime().format(timeFormatter) : "-");
                table.addCell(log.getClockOutTime() != null ? log.getClockOutTime().format(timeFormatter) : "-");
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateAllLeaveReport(int month, int year) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.COURIER, 14, BaseColor.BLACK);
            Paragraph para = new Paragraph("Organization Leave Report - " + month + "/" + year, titleFont);
            para.setAlignment(Element.ALIGN_CENTER);
            document.add(para);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(6);
            Stream.of("Employee", "Type", "From", "To", "Days", "Status")
                    .forEach(headerTitle -> {
                        PdfPCell header = new PdfPCell();
                        header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        header.setBorderWidth(1);
                        header.setPhrase(new Phrase(headerTitle));
                        table.addCell(header);
                    });

            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

            List<LeaveRequest> leaves = leaveRequestRepository.findByStartDateBetween(startDate, endDate);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            for (LeaveRequest leave : leaves) {
                table.addCell(leave.getUser().getFullName());
                table.addCell(leave.getLeaveType());
                table.addCell(leave.getStartDate().format(dateFormatter));
                table.addCell(leave.getEndDate().format(dateFormatter));
                table.addCell(String.valueOf(leave.getDays()));
                table.addCell(leave.getStatus().toString());
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generatePayrollReport(int month, int year) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Payroll Summary - " + month + "/" + year,
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            Stream.of("Employee", "Total Hours", "Hourly Rate", "Est. Salary")
                    .forEach(h -> {
                        PdfPCell cell = new PdfPCell(new Phrase(h));
                        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        table.addCell(cell);
                    });

            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

            List<User> users = userRepository.findAll();
            for (User user : users) {
                List<Attendance> userLogs = attendanceRepository.findByUserAndDateBetween(user, startDate, endDate);
                double totalHours = userLogs.stream()
                        .mapToDouble(a -> a.getTotalHours() != null ? a.getTotalHours() : 0.0)
                        .sum();
                double hourlyRate = 25.0; // Mock rate
                double salary = totalHours * hourlyRate;

                table.addCell(user.getFullName());
                table.addCell(String.format("%.2f", totalHours));
                table.addCell("$" + hourlyRate);
                table.addCell("$" + String.format("%.2f", salary));
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateLateInReport(int month, int year) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Late In Report - " + month + "/" + year,
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            Stream.of("Employee", "Date", "Check In", "Late Duration")
                    .forEach(h -> {
                        PdfPCell cell = new PdfPCell(new Phrase(h));
                        cell.setBackgroundColor(BaseColor.ORANGE);
                        table.addCell(cell);
                    });

            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

            List<Attendance> logs = attendanceRepository.findByDateBetween(startDate, endDate);
            DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

            for (Attendance log : logs) {
                if (log.getClockInTime() != null) {
                    java.time.LocalTime checkIn = log.getClockInTime().toLocalTime();
                    // Assume 9:30 AM is late threshold
                    if (checkIn.isAfter(java.time.LocalTime.of(9, 30))) {
                        table.addCell(log.getUser().getFullName());
                        table.addCell(log.getDate().toString());
                        table.addCell(checkIn.format(timeFmt));
                        long minutesLate = java.time.temporal.ChronoUnit.MINUTES
                                .between(java.time.LocalTime.of(9, 30), checkIn);
                        table.addCell(minutesLate + " mins");
                    }
                }
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }
}
