package com.jobtracker.controller;

import com.jobtracker.entity.Job;
import com.jobtracker.entity.Users;
import com.jobtracker.service.JobService;
import com.jobtracker.service.RecommendationService;
import com.jobtracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor // 这个注解会自动为所有 final 字段生成构造器
@Slf4j
public class JobController {

    private final JobService jobService;
    private final UserService userService;
    private final RecommendationService recommendationService;


    // 公开访问的接口
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(jobService.searchJobs(title, company, location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // 需要认证的接口 - 用户收藏
    @GetMapping("/favorites")
    public ResponseEntity<List<Job>> getUserFavorites(Authentication authentication) {
        Users user = userService.getUserFromAuthentication(authentication);
        return ResponseEntity.ok(jobService.getUserFavorites(user));
    }

    @PostMapping("/{jobId}/favorite")
    public ResponseEntity<Void> addToFavorites(
            @PathVariable Long jobId,
            @RequestBody(required = false) String notes,
            Authentication authentication) {
        Users user = userService.getUserFromAuthentication(authentication);
        jobService.addToFavorites(user, jobId, notes);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{jobId}/favorite")
    public ResponseEntity<Void> removeFromFavorites(
            @PathVariable Long jobId,
            Authentication authentication) {
        Users user = userService.getUserFromAuthentication(authentication);
        jobService.removeFromFavorites(user, jobId);
        return ResponseEntity.ok().build();
    }




    // 👇 *** 新增的文件上传接口 *** 👇
    @PostMapping("/recommend-file")
    public ResponseEntity<?> getRecommendationsFromFile(
            @RequestParam("resume") MultipartFile file,
            @RequestHeader("Authorization") String authToken) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        try {
            List<Map<String, Object>> recommendedJobs = recommendationService.getRecommendationsFromFile(file, authToken);
            return ResponseEntity.ok(recommendedJobs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting recommendations: " + e.getMessage());
        }
    }
}