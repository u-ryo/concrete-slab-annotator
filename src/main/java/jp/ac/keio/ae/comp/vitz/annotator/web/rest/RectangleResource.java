package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import com.codahale.metrics.annotation.Timed;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Rectangle;

import jp.ac.keio.ae.comp.vitz.annotator.repository.RectangleRepository;
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
 * REST controller for managing Rectangle.
 */
@RestController
@RequestMapping("/api")
public class RectangleResource {

    private final Logger log = LoggerFactory.getLogger(RectangleResource.class);

    private static final String ENTITY_NAME = "rectangle";

    private final RectangleRepository rectangleRepository;

    public RectangleResource(RectangleRepository rectangleRepository) {
        this.rectangleRepository = rectangleRepository;
    }

    /**
     * POST  /rectangles : Create a new rectangle.
     *
     * @param rectangle the rectangle to create
     * @return the ResponseEntity with status 201 (Created) and with body the new rectangle, or with status 400 (Bad Request) if the rectangle has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/rectangles")
    @Timed
    public ResponseEntity<Rectangle> createRectangle(@Valid @RequestBody Rectangle rectangle) throws URISyntaxException {
        log.debug("REST request to save Rectangle : {}", rectangle);
        if (rectangle.getId() != null) {
            throw new BadRequestAlertException("A new rectangle cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Rectangle result = rectangleRepository.save(rectangle);
        return ResponseEntity.created(new URI("/api/rectangles/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /rectangles : Updates an existing rectangle.
     *
     * @param rectangle the rectangle to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated rectangle,
     * or with status 400 (Bad Request) if the rectangle is not valid,
     * or with status 500 (Internal Server Error) if the rectangle couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/rectangles")
    @Timed
    public ResponseEntity<Rectangle> updateRectangle(@Valid @RequestBody Rectangle rectangle) throws URISyntaxException {
        log.debug("REST request to update Rectangle : {}", rectangle);
        if (rectangle.getId() == null) {
            return createRectangle(rectangle);
        }
        Rectangle result = rectangleRepository.save(rectangle);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, rectangle.getId().toString()))
            .body(result);
    }

    /**
     * GET  /rectangles : get all the rectangles.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of rectangles in body
     */
    @GetMapping("/rectangles")
    @Timed
    public List<Rectangle> getAllRectangles() {
        log.debug("REST request to get all Rectangles");
        return rectangleRepository.findAll();
        }

    /**
     * GET  /rectangles/:id : get the "id" rectangle.
     *
     * @param id the id of the rectangle to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the rectangle, or with status 404 (Not Found)
     */
    @GetMapping("/rectangles/{id}")
    @Timed
    public ResponseEntity<Rectangle> getRectangle(@PathVariable Long id) {
        log.debug("REST request to get Rectangle : {}", id);
        Rectangle rectangle = rectangleRepository.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(rectangle));
    }

    /**
     * DELETE  /rectangles/:id : delete the "id" rectangle.
     *
     * @param id the id of the rectangle to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/rectangles/{id}")
    @Timed
    public ResponseEntity<Void> deleteRectangle(@PathVariable Long id) {
        log.debug("REST request to delete Rectangle : {}", id);
        rectangleRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
