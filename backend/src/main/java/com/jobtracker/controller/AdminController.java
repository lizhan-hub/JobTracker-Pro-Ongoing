// src/main/java/com/jobtracker/controller/AdminController.java
package com.jobtracker.controller;

import com.jobtracker.entity.Job;
import com.jobtracker.entity.Users;
import com.jobtracker.service.JobService;
import com.jobtracker.service.UserService; // 假设您有一个UserService
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin") // 所有接口都以 /api/admin 开头
@RequiredArgsConstructor // 这个注解会自动为所有 final 字段生成构造器
public class AdminController {

    private final JobService jobService;

    /**
     * 获取所有用户的数据
     * 这个接口因为路径是 /api/admin/users，所以会被SecurityConfig拦截
     * 只有ADMIN角色的用户才能成功调用
     */
    // 管理员接口
    @PutMapping("job/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job job) {
        return ResponseEntity.ok(jobService.updateJob(id, job));
    }

    @DeleteMapping("job/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok().build();
    }

    // 您可以在这里添加更多管理员专属的功能，比如删除用户、查看系统日志等
}