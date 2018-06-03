package jp.ac.keio.ae.comp.vitz.annotator.repository;

import jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the Annotation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AnnotationRepository extends JpaRepository<Annotation, Long> {

}
