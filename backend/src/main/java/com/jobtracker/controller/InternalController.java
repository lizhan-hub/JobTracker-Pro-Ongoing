package com.jobtracker.controller;
import com.jobtracker.entity.Job;
import com.jobtracker.service.JobService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internal") // 所有内部接口都以 /api/internal 开头
public class InternalController {

    private final JobService jobService;

    @Value("${app.internal-api-key}") // 从配置文件注入API Key
    private String internalApiKey;

    public InternalController(JobService jobService) {
        this.jobService = jobService;
    }

    /**
     * 内部接口：获取所有职位信息 (供AI服务使用)
     */
    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobsForInternalService(@RequestHeader("X-Internal-API-Key") String apiKey) {
        if (!isApiKeyValid(apiKey)) {
            return unauthorizedResponse();
        }
        return ResponseEntity.ok(jobService.getAllPublicJobs());
    }

    /**
     * 内部接口：批量接收爬虫抓取的职位数据
     */
    @PostMapping("/jobs/batch-intake")
    public ResponseEntity<?> createJobsFromScraper(
            @RequestBody List<Job> jobs,
            @RequestHeader("X-Internal-API-Key") String apiKey) {

        if (!isApiKeyValid(apiKey)) {
            return unauthorizedResponse();
        }

        if (jobs == null || jobs.isEmpty()) {
            return ResponseEntity.badRequest().body("职位列表不能为空");
        }

        try {
            List<Job> savedJobs = jobService.createJobsBatch(jobs);
            return ResponseEntity.ok(Map.of(
                "message", "成功批量保存职位",
                "count", savedJobs.size(),
                "jobs", savedJobs
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "批量保存职位失败: " + e.getMessage()));
        }
    }

    // 辅助方法，用于验证API Key
    private boolean isApiKeyValid(String apiKey) {
        return internalApiKey.equals(apiKey);
    }

    // 辅助方法，返回未授权的响应
    private ResponseEntity<String> unauthorizedResponse() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing API Key");
    }
}
