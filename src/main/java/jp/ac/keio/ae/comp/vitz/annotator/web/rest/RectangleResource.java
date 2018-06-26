package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import com.codahale.metrics.annotation.Timed;
import jp.ac.keio.ae.comp.vitz.annotator.domain.AccessLog;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation;
import jp.ac.keio.ae.comp.vitz.annotator.domain.AnnotationXml;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Rectangle;
import jp.ac.keio.ae.comp.vitz.annotator.domain.User;

import jp.ac.keio.ae.comp.vitz.annotator.repository.AccessLogRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.AnnotationRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.RectangleRepository;
import jp.ac.keio.ae.comp.vitz.annotator.service.UserService;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.errors.BadRequestAlertException;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import static org.springframework.data.domain.Sort.Direction.*;

/**
 * REST controller for managing Rectangle.
 */
@RestController
@RequestMapping("/api")
public class RectangleResource {

    private final Logger log = LoggerFactory.getLogger(RectangleResource.class);

    private static final String ENTITY_NAME = "rectangle";
    private static final ZoneId TOKYO = ZoneId.of("Asia/Tokyo");
    // https://github.com/yamkazu/springdata-jpa-example/blob/pageable/src/test/java/org/yamkazu/springdata/EmpRepositoryTest.java
    // https://www.petrikainulainen.net/programming/spring-framework/spring-data-jpa-tutorial-part-seven-pagination/
    // https://stackoverflow.com/questions/9314078/setmaxresults-for-spring-data-jpa-annotation?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    private static final Pageable TOP_TO = new PageRequest(0, 1, DESC, "to");
    private static final int INTERVAL = 5;
    private static final double RATE = 0.46;

    private final AccessLogRepository accessLogRepository;
    private final AnnotationRepository annotationRepository;
    private final RectangleRepository rectangleRepository;
    private final UserService userService;

    public RectangleResource(AccessLogRepository accessLogRepository,
                             AnnotationRepository annotationRepository,
                             RectangleRepository rectangleRepository,
                             UserService userService) {
        this.accessLogRepository = accessLogRepository;
        this.annotationRepository = annotationRepository;
        this.rectangleRepository = rectangleRepository;
        this.userService = userService;
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

    /**
     * GET  /rectangles/annotation/{annotationId} : get the rectangles which belong to the annotation with the specified annotationId.
     *
     * @param annotationId the annotationId of the rectangles belong to
     * @return the ResponseEntity with status 200 (OK) and the list of rectangles in body
     */
    @GetMapping("/rectangles/annotation/{annotationId}")
    @Timed
    public Map<String, Rectangle> getRectanglesWithAnnotationId
        (@PathVariable Long annotationId) {
        log.debug("REST request to get Rectangles with annotationId:{}",
                  annotationId);
        return rectangleRepository.findByAnnotationId(annotationId).stream()
            .collect(Collectors.toMap
                     (r -> r.getCoordinateX() + "," + r.getCoordinateY(),
                      r -> r,
                      (r1, r2) -> r2));
    }

    /**
     * POST  /rectangles/annotation/{annotationId} : save the rectangles which belong to the annotation with the specified annotationId.
     *
     * @param annotationId annotationId of rectangles belong to
     * @return the ResponseEntity with status 200 (OK)
s in body
     */
    @PostMapping("/rectangles/annotation/{annotationId}")
    @Timed
    public ResponseEntity<Void> saveRectanglesWithAnnotationId
        (@PathVariable Long annotationId,
         @Valid @RequestBody Set<Rectangle> rectangles) {
        log.debug("REST request to save Rectangles with annotationId:{}, {}",
                  annotationId, rectangles);
        CompletableFuture.runAsync(() ->
                                   saveRectangles(annotationId, rectangles));
        return ResponseEntity.ok().build();
        // return rectangles.stream()
        //     .collect(Collectors.toMap
        //              (r -> r.getCoordinateX() + "," + r.getCoordinateY(),
        //               r -> r,
        //               (r1, r2) -> r2));
    }

    private void saveRectangles(Long annotationId, Set<Rectangle> rectangles) {
        Map<String, Rectangle> rectangleMap =
            rectangleRepository.findByAnnotationId(annotationId).stream()
            .collect(Collectors.toMap
                     (r -> r.getCoordinateX() + "," + r.getCoordinateY(),
                      r -> r, (r1, r2) -> r2));
        Annotation annotation = annotationRepository.findOne(annotationId);
        log.debug("annotation:{}", annotation);
        rectangles =
            rectangles.stream()
            .map(r -> rectangleRepository.save
                 (r.id(Optional.ofNullable
                       (rectangleMap.get(r.getCoordinateX() + ","
                                         + r.getCoordinateY()))
                       .orElse(new Rectangle()).getId())
                  .annotation(annotation)))
            .collect(Collectors.toSet());
        rectangleMap.values().removeAll(rectangles);
        rectangleMap.values().stream()
            .forEach(r -> rectangleRepository.delete(r.getId()));

        List<AccessLog> accessLogs =
            accessLogRepository
            .findByUserIsCurrentUserAndAnnotationId(annotationId, TOP_TO);
        ZonedDateTime now = ZonedDateTime.now(TOKYO);
        // https://qiita.com/kurukurupapa@github/items/f55395758eba03d749c9
        // http://www.atmarkit.co.jp/ait/articles/1501/29/news016_2.html
        log.debug("accessLogs:{}, isAfter?{}", accessLogs,
                  accessLogs.isEmpty() ? "EMPTY"
                  : accessLogs.get(0).getTo().plusMinutes(INTERVAL).isBefore(now));
        if (accessLogs.isEmpty()
            || accessLogs.get(0).getTo().plusMinutes(INTERVAL).isBefore(now)) {
            User user = userService.getUserWithAuthorities().orElse(null);
            accessLogRepository.save(new AccessLog().from(now).to(now)
                                     .user(user).annotation(annotation));
        } else {
            accessLogRepository.save(accessLogs.get(0).to(now));
        }
    }
    
    /**
     * GET  /rectangles/xml/annotation/{annotationId} : get the rectangles XML which belong to the annotation with the specified annotationId.
     * ref. http://blog.rakugakibox.net/entry/2014/11/23/java_spring_boot_rest
     *
     * @param annotationId annotationId of rectangles belong to
     * @return the ResponseEntity with status 200 (OK)
s in body
     */
    @GetMapping("/rectangles/xml/annotation/{annotationId}")
    @Timed
    public AnnotationXml getAnnotationXml(@PathVariable Long annotationId) {
        log.debug("REST request to get AnnotationXml with annotationId:{}",
                  annotationId);
        Annotation annotation = annotationRepository.findOne(annotationId);
        String filename = annotation.getImage().getFilename();
        int index = filename.indexOf("/", 8);
        int lastIndex = filename.lastIndexOf("/");
        String folder = filename;
        if (index > 0 && lastIndex > 0) {
            folder = filename.substring(index, lastIndex);
        }

        int squareSize = annotation.getSquareSize();
        int width = annotation.getImage().getWidth();
        double distance = annotation.getImage().getDistance();
        int focalLength = annotation.getImage().getFocalLength();
        double rate = distance * RATE / focalLength / squareSize;
        // int columns = (int) Math.round(rate * width);
        int columns = 153;
        int interval = width / columns;
        log.debug("squareSize:{},width:{},distance:{},focalLength:{},rate:{},"
                  + "columns:{},interval:{}", squareSize, width, distance,
                  focalLength, rate, columns, interval);

        AnnotationXml annotationXml = new AnnotationXml()
            .folder(folder)
            .filename(filename.substring(lastIndex + 1))
            .size(new AnnotationXml.Size()
                  .width(annotation.getImage().getWidth())
                  .height(annotation.getImage().getHeight())
                  .depth(3))
            .object(rectangleRepository.findByAnnotationId(annotationId)
                    .stream()
                    .parallel()
                    .filter(r -> !r.isPending())
                    .map(r -> new AnnotationXml.Obj()
                         .name(annotation.getDefect().name())
                         .pose("Unspecified")
                         .truncated(0)
                         .difficult(0)
                         .bndbox(new AnnotationXml.Bndbox()
                                 .xmin(r.getCoordinateX() * interval)
                                 .ymin(r.getCoordinateY() * interval)
                                 .xmax((r.getCoordinateX() + 1) * interval)
                                 .ymax((r.getCoordinateY() + 1) * interval)))
                                 // .xmin(r.getX())
                                 // .ymin(r.getY())
                                 // .xmax(r.getX() + r.getWidth())
                                 // .ymax(r.getY() + r.getHeight())))
                    .collect(Collectors.toList()));
        return annotationXml;
    }
}
