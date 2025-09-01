package com.jobtracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})  // 忽略懒加载相关属性
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"title", "company"})
})
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String company;
    private String location;
    private String url;
    private String source;
    @Column(columnDefinition = "TEXT")
    private String description;
}