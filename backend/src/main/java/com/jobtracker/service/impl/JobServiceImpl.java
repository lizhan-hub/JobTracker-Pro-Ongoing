package com.jobtracker.service.impl;

import com.jobtracker.entity.Job;
import com.jobtracker.entity.Users;
import com.jobtracker.entity.UserFavorite;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.repository.UserFavoriteRepository;
import com.jobtracker.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final UserFavoriteRepository userFavoriteRepository;

    @Override
    @Cacheable(value = "jobs", key = "'all'")
    public List<Job> getAllPublicJobs() {
        return jobRepository.findAll();
    }


    @Override
    @Cacheable(value = "jobs", key = "T(String).format('search:%s:%s:%s', #title != null ? #title : 'null', #company != null ? #company : 'null', #location != null ? #location : 'null')")
    public List<Job> searchJobs(String title, String company, String location) {
        // 如果没有搜索参数，直接返回所有职位（使用all缓存）
        if ((title == null || title.trim().isEmpty()) && 
            (company == null || company.trim().isEmpty()) && 
            (location == null || location.trim().isEmpty())) {
            return getAllPublicJobs();
        }
        return jobRepository.searchJobs(title, company, location);
    }

    @Override
    @Cacheable(value = "jobs", key = "'job:' + #id")
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @Override
    public List<Job> getUserFavorites(Users user) {
        List<UserFavorite> favorites = userFavoriteRepository.findByUserWithJob(user);
        return favorites.stream()
                .map(UserFavorite::getJob)
                .toList();
    }

    @Override
    public void addToFavorites(Users user, Long jobId, String notes) {
        Job job = getJobById(jobId);
        if (!userFavoriteRepository.existsByUserAndJob(user, job)) {
            UserFavorite favorite = new UserFavorite();
            favorite.setUser(user);
            favorite.setJob(job);
            favorite.setNotes(notes);
            userFavoriteRepository.save(favorite);
        }
    }

    @Override
    public void removeFromFavorites(Users user, Long jobId) {
        Job job = getJobById(jobId);
        userFavoriteRepository.deleteByUserAndJob(user, job);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    @CacheEvict(value = "jobs", allEntries = true)  // 清除所有jobs缓存
    public Job createJob(Job job) {
        // 验证URL不为空
        if (job.getUrl() == null || job.getUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("职位URL不能为空");
        }
        
        // 检查是否已存在相同的职位（基于URL）
        Optional<Job> existingJob = jobRepository.findByUrl(job.getUrl());
        if (existingJob.isPresent()) {
            throw new IllegalArgumentException("职位URL已存在: " + job.getUrl());
        }
        
        return jobRepository.save(job);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    @CacheEvict(value = "jobs", allEntries = true)  // 清除所有jobs缓存
    public List<Job> createJobsBatch(List<Job> jobs) {
        if (jobs == null || jobs.isEmpty()) {
            return List.of();
        }
        
        List<Job> savedJobs = new ArrayList<>();
        List<Job> skippedJobs = new ArrayList<>();
        
        System.out.println("开始批量保存 " + jobs.size() + " 个职位...");
        
        for (Job job : jobs) {
            try {
                // 验证URL不为空
                if (job.getUrl() == null || job.getUrl().trim().isEmpty()) {
                    System.err.println("跳过无效职位（URL为空）: " + job.getTitle() + " - " + job.getCompany());
                    skippedJobs.add(job);
                    continue;
                }
                
                // 检查是否已存在相同的职位（基于URL）
                Optional<Job> existingJob = jobRepository.findByUrl(job.getUrl());
                
                if (existingJob.isPresent()) {
                    // 如果存在，跳过重复职位
                    skippedJobs.add(job);
                    System.out.println("跳过重复职位（URL已存在）: " + job.getTitle() + " - " + job.getCompany() + " | URL: " + job.getUrl());
                } else {
                    // 如果不存在，则保存新职位
                    Job savedJob = jobRepository.save(job);
                    savedJobs.add(savedJob);
                    System.out.println("成功保存职位: " + job.getTitle() + " - " + job.getCompany());
                }
            } catch (Exception e) {
                System.err.println("保存职位时出错: " + job.getTitle() + " - " + job.getCompany() + ", 错误: " + e.getMessage());
                // 在事务中，单个职位出错不会影响其他职位的保存
                skippedJobs.add(job);
            }
        }
        
        System.out.println("批量保存完成 - 成功: " + savedJobs.size() + ", 跳过: " + skippedJobs.size());
        return savedJobs;
    }

    @Override
    @CacheEvict(value = "jobs", allEntries = true)  // 清除所有jobs缓存
    public Job updateJob(Long id, Job job) {
        Job existingJob = getJobById(id);
        job.setId(id);
        return jobRepository.save(job);
    }

    @Override
    @CacheEvict(value = "jobs", allEntries = true)  // 清除所有jobs缓存
    public void deleteJob(Long id) {
        Job job = getJobById(id);
        jobRepository.delete(job);
    }
}