package com.jobtracker.repository;
import com.jobtracker.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // 搜索职位
    List<Job> findByTitleContainingIgnoreCase(String title);
    List<Job> findByCompanyContainingIgnoreCase(String company);
    List<Job> findByLocationContainingIgnoreCase(String location);
    
    // 查找重复职位（基于URL）
    Optional<Job> findByUrl(String url);
    
    // 组合搜索
    @Query("SELECT j FROM Job j WHERE " +
           "(:title IS NULL OR j.title LIKE %:title%) AND " +
           "(:company IS NULL OR j.company LIKE %:company%) AND " +
           "(:location IS NULL OR j.location LIKE %:location%)")
    List<Job> searchJobs(String title, String company, String location);
}