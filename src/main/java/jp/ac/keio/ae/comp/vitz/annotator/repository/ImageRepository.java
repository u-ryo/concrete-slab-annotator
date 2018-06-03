package jp.ac.keio.ae.comp.vitz.annotator.repository;

import jp.ac.keio.ae.comp.vitz.annotator.domain.Image;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;


/**
 * Spring Data JPA repository for the Image entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

}
