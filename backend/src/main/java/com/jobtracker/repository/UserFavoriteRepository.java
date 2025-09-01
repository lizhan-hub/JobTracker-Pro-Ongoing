 package com.jobtracker.repository;
import com.jobtracker.entity.UserFavorite;
import com.jobtracker.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    List<UserFavorite> findByUser(Users user);
    
    // 只JOIN FETCH Job，不JOIN FETCH User（因为我们不需要用户信息）
    @Query("SELECT uf FROM UserFavorite uf JOIN FETCH uf.job WHERE uf.user = :user")
    List<UserFavorite> findByUserWithJob(Users user);
    
    boolean existsByUserAndJob(Users user, com.jobtracker.entity.Job job);
    
    @Modifying
    @Query("DELETE FROM UserFavorite uf WHERE uf.user = :user AND uf.job = :job")
    void deleteByUserAndJob(Users user, com.jobtracker.entity.Job job);
}