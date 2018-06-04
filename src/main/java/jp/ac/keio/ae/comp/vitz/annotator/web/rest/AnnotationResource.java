package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import com.codahale.metrics.annotation.Timed;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation;
import jp.ac.keio.ae.comp.vitz.annotator.domain.enumeration.DefectName;

import jp.ac.keio.ae.comp.vitz.annotator.repository.AnnotationRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.ImageRepository;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.errors.BadRequestAlertException;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Annotation.
 */
@RestController
@RequestMapping("/api")
public class AnnotationResource {

    private final Logger log = LoggerFactory.getLogger(AnnotationResource.class);

    private static final String ENTITY_NAME = "annotation";

    private final AnnotationRepository annotationRepository;
    private final ImageRepository imageRepository;

    public AnnotationResource(AnnotationRepository annotationRepository,
                              ImageRepository imageRepository) {
        this.annotationRepository = annotationRepository;
        this.imageRepository = imageRepository;
    }

    /**
     * POST  /annotations : Create a new annotation.
     *
     * @param annotation the annotation to create
     * @return the ResponseEntity with status 201 (Created) and with body the new annotation, or with status 400 (Bad Request) if the annotation has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/annotations")
    @Timed
    public ResponseEntity<Annotation> createAnnotation(@Valid @RequestBody Annotation annotation) throws URISyntaxException {
        log.debug("REST request to save Annotation : {}", annotation);
        if (annotation.getId() != null) {
            throw new BadRequestAlertException("A new annotation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Annotation result = annotationRepository.save(annotation);
        return ResponseEntity.created(new URI("/api/annotations/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /annotations : Updates an existing annotation.
     *
     * @param annotation the annotation to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated annotation,
     * or with status 400 (Bad Request) if the annotation is not valid,
     * or with status 500 (Internal Server Error) if the annotation couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/annotations")
    @Timed
    public ResponseEntity<Annotation> updateAnnotation(@Valid @RequestBody Annotation annotation) throws URISyntaxException {
        log.debug("REST request to update Annotation : {}", annotation);
        if (annotation.getId() == null) {
            return createAnnotation(annotation);
        }
        Annotation result = annotationRepository.save(annotation);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, annotation.getId().toString()))
            .body(result);
    }

    /**
     * GET  /annotations : get all the annotations.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of annotations in body
     */
    @GetMapping("/annotations")
    @Timed
    public List<Annotation> getAllAnnotations() {
        log.debug("REST request to get all Annotations");
        return annotationRepository.findAll();
        }

    /**
     * GET  /annotations/:id : get the "id" annotation.
     *
     * @param id the id of the annotation to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the annotation, or with status 404 (Not Found)
     */
    @GetMapping("/annotations/{id}")
    @Timed
    public ResponseEntity<Annotation> getAnnotation(@PathVariable Long id) {
        log.debug("REST request to get Annotation : {}", id);
        Annotation annotation = annotationRepository.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(annotation));
    }

    /**
     * DELETE  /annotations/:id : delete the "id" annotation.
     *
     * @param id the id of the annotation to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/annotations/{id}")
    @Timed
    public ResponseEntity<Void> deleteAnnotation(@PathVariable Long id) {
        log.debug("REST request to delete Annotation : {}", id);
        annotationRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * GET  /annotations/:imageId/:squareSize/:defect : get annotation with
     * the specified "imageId", "squareSize", and "defect".
     *
     * @param imageId the imageId of the annotation to retrieve
     * @param squareSize the squareSize of the annotation to retrieve
     * @param defect the defect of the annotation to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the annotation, or with status 404 (Not Found)
     */
    @GetMapping("/annotations/{imageId}/{squareSize}/{defect}")
    @Timed
    public ResponseEntity<Annotation>
        getAnnotationWithImageIdSquareSizeAndDefect
        (@PathVariable Long imageId, @PathVariable Integer squareSize,
         @PathVariable String defect) {
        log.debug("REST request to get Annotation : imageId:{}, squareSize:{}, "
                  + "defect:{}", imageId, squareSize, defect);
        Annotation annotation =
            annotationRepository.findWithImageIdSquareSizeAndDefect
            (imageId, squareSize, DefectName.valueOf(defect))
            .orElseGet(() -> annotationRepository
                       .save(new Annotation()
                             .image(imageRepository.findOne(imageId))
                             .squareSize(squareSize)
                             .defect(DefectName.valueOf(defect))));
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(annotation));
    }
}
