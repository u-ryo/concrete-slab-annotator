package jp.ac.keio.ae.comp.vitz.annotator.repository;

import jp.ac.keio.ae.comp.vitz.annotator.domain.Rectangle;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Set;


/**
 * Spring Data JPA repository for the Rectangle entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RectangleRepository extends JpaRepository<Rectangle, Long> {
    @Query("SELECT r FROM Rectangle r WHERE r.annotation.id = :annotationId")
    Set<Rectangle> findWithAnnotationId(@Param("annotationId") Long annotationId);

    @Query("DELETE FROM Rectangle r WHERE r.annotation.id = :annotationId AND r.coordinateX = :coordinateX AND r.coordinateY = :coordinateY")
    Integer deleteWithAnnotationIdAndCoordinate
        (@Param("annotationId") Long annotationId,
         @Param("coordinateX") Integer coordinateX,
         @Param("coordinateY") Integer coordinateY);

    @Query("SELECT r FROM Rectangle r WHERE r.annotation.id = :annotationId AND r.coordinateX = :coordinateX AND r.coordinateY = :coordinateY")
    Set<Rectangle> findWithCoordinate(@Param("annotationId") Long annotationId,
                                      @Param("coordinateX") Integer coordinateX,
                                      @Param("coordinateY") Integer coordinateY);
}
