package com.jobtracker.controller;

import com.jobtracker.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
public class CacheController {

    private final CacheManager cacheManager;
    private final RedisUtil redisUtil;

    /**
     * 清除所有缓存
     */
    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> clearAllCache() {
        cacheManager.getCacheNames()
                .forEach(cacheName -> cacheManager.getCache(cacheName).clear());
        redisUtil.clearAll();
        return ResponseEntity.ok("所有缓存已清除");
    }

    /**
     * 清除指定缓存
     */
    @DeleteMapping("/clear/{cacheName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> clearCache(@PathVariable String cacheName) {
        var cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            return ResponseEntity.ok("缓存 " + cacheName + " 已清除");
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 获取缓存统计信息
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getCacheStats() {
        StringBuilder stats = new StringBuilder();
        stats.append("缓存统计信息:\n");
        
        cacheManager.getCacheNames().forEach(cacheName -> {
            var cache = cacheManager.getCache(cacheName);
            if (cache instanceof org.springframework.data.redis.cache.RedisCache) {
                stats.append(cacheName).append(": Redis缓存\n");
            } else {
                stats.append(cacheName).append(": 本地缓存\n");
            }
        });
        
        return ResponseEntity.ok(stats.toString());
    }
}
