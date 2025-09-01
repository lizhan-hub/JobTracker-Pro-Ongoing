 package com.jobtracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "user_favorites")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})  // 忽略懒加载相关属性
public class UserFavorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)  // 改回懒加载，不需要用户信息
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.EAGER)  // 保持即时加载，需要工作信息
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    private LocalDateTime favoritedAt = LocalDateTime.now();
    private String notes;
}