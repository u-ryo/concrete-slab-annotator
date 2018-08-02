package jp.ac.keio.ae.comp.vitz.annotator.repository;

import jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation;
import jp.ac.keio.ae.comp.vitz.annotator.domain.enumeration.DefectName;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

/**
 * Spring Data JPA repository for the Annotation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AnnotationRepository extends JpaRepository<Annotation, Long> {
    @Query("SELECT a FROM Annotation a WHERE a.image.id = :imageId AND a.squareSize = :squareSize")
    Set<Annotation> findByImageIdAndSquareSize
        (@Param("imageId") Long imageId,
         @Param("squareSize") Integer squareSize);

    @Query("SELECT a FROM Annotation a WHERE a.image.id = :imageId AND a.squareSize = :squareSize AND a.defect = :defect")
    Optional<Annotation> findByImageIdSquareSizeAndDefect
        (@Param("imageId") Long imageId,
         @Param("squareSize") Integer squareSize,
         @Param("defect") DefectName defect);
}
