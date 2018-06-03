package jp.ac.keio.ae.comp.vitz.annotator.repository;

import jp.ac.keio.ae.comp.vitz.annotator.domain.Rectangle;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the Rectangle entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RectangleRepository extends JpaRepository<Rectangle, Long> {

}
