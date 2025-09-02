package com.jobtracker.service.impl;

import com.jobtracker.service.RecommendationService;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile; // 导入
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.io.ByteArrayResource;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
// ...

@Service
public class RecommendationServiceImpl implements RecommendationService {
    // ... 已有的代码 ...
    private final String aiServiceFileUrl = "http://localhost:5000/recommend_file";
    private final RestTemplate restTemplate = new RestTemplate();
    @Override
    public List<Map<String, Object>> getRecommendationsFromFile(MultipartFile resumeFile, String authToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        // 将前端传来的认证Token转发给Python服务
        headers.set("Authorization", authToken);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        try {
            // 将 MultipartFile 包装成可以发送的资源
            ByteArrayResource fileAsResource = new ByteArrayResource(resumeFile.getBytes()) {
                @Override
                public String getFilename() {
                    return resumeFile.getOriginalFilename();
                }
            };
            body.add("resume_file", fileAsResource);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<List> response = restTemplate.postForEntity(aiServiceFileUrl, requestEntity, List.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to get recommendations from AI service. Status: " + response.getStatusCode());
        }
    }
}
