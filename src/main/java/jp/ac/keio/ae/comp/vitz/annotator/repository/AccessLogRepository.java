package jp.ac.keio.ae.comp.vitz.annotator.repository;

import jp.ac.keio.ae.comp.vitz.annotator.domain.AccessLog;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

/**
 * Spring Data JPA repository for the AccessLog entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    @Query("SELECT access_log FROM AccessLog access_log WHERE access_log.user.login = ?#{principal.username}")
    List<AccessLog> findByUserIsCurrentUser();

    @Query("SELECT access_log FROM AccessLog access_log WHERE access_log.user.login = ?#{principal.username} AND access_log.annotation.id = :annotationId ORDER BY access_log.to DESC")
    List<AccessLog> findByUserIsCurrentUserAndAnnotationId
        (@Param("annotationId") Long annotationId, Pageable pageable);

    @Query("SELECT access_log FROM AccessLog access_log WHERE access_log.user.id = :userId AND access_log.annotation.id = :annotationId ORDER BY access_log.to DESC")
    List<AccessLog> findByUserIdAndAnnotationId
        (@Param("userId") Long userId, @Param("annotationId") Long annotationId,
         Pageable pageable);
}
