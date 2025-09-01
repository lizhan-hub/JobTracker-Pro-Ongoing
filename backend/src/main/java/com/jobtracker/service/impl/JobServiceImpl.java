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

import java.util.List;

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
    @CacheEvict(value = "jobs", key = "'all'")  // 只清除all缓存，保留其他搜索缓存
    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    @Override
    @CacheEvict(value = "jobs", key = "'all'")  // 只清除all缓存
    public Job updateJob(Long id, Job job) {
        Job existingJob = getJobById(id);
        job.setId(id);
        return jobRepository.save(job);
    }

    @Override
    @CacheEvict(value = "jobs", key = "'all'")  // 只清除all缓存
    public void deleteJob(Long id) {
        Job job = getJobById(id);
        jobRepository.delete(job);
    }

    @Override
    public List<Job> recommendJobs(String query) {
        // TODO: 实现推荐逻辑
        return List.of();
    }

    @Override
    public void fetchAndStoreJobsFromExternalSources(String query) {
        // TODO: 实现爬虫逻辑
    }
}