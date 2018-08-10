package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.ObjectMapper;
import jp.ac.keio.ae.comp.vitz.annotator.domain.AccessLog;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation;
import jp.ac.keio.ae.comp.vitz.annotator.domain.AnnotationXml;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Image;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Rectangle;
import jp.ac.keio.ae.comp.vitz.annotator.domain.User;

import jp.ac.keio.ae.comp.vitz.annotator.repository.AccessLogRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.AnnotationRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.ImageRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.RectangleRepository;
import jp.ac.keio.ae.comp.vitz.annotator.service.UserService;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.errors.BadRequestAlertException;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

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
    private final ImageRepository imageRepository;
    private final RectangleRepository rectangleRepository;
    private final UserService userService;

    public RectangleResource(AccessLogRepository accessLogRepository,
                             AnnotationRepository annotationRepository,
                             ImageRepository imageRepository,
                             RectangleRepository rectangleRepository,
                             UserService userService) {
        this.accessLogRepository = accessLogRepository;
        this.annotationRepository = annotationRepository;
        this.imageRepository = imageRepository;
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
     * @return the AnnotationXml with status 200 (OK)
     */
    @GetMapping("/rectangles/xml/annotation/{annotationId}")
    @Timed
    public AnnotationXml getAnnotationXml(@PathVariable Long annotationId) {
        log.debug("REST request to get AnnotationXml with annotationId:{}",
                  annotationId);
        Annotation annotation = annotationRepository.findOne(annotationId);
        int squareSize = annotation.getSquareSize();
        return getAnnotationXml
            (annotation.getImage(), squareSize,
             rectangleRepository.findByAnnotationId(annotationId), true);
    }

    /**
     * GET  /rectangles/xml/image/{imageId} : get the rectangles XML which belong to the annotations with the specified imageId.
     *
     * @param imageId imageId of rectangles belong to
     * @return the AnnotationXml with status 200 (OK)
     */
    @GetMapping("/rectangles/xml/image/{imageId}/{squareSize}")
    @Timed
    public AnnotationXml getImageAnnotationXml(@PathVariable Long imageId,
                                               @PathVariable Integer squareSize) {
        log.debug("REST request to get AnnotationXml with imageId:{} "
                  + "squareSize:{}", imageId, squareSize);
        Set<Annotation> annotations =
            annotationRepository.findByImageIdAndSquareSize(imageId, squareSize);
        log.debug("annotations:{}", annotations);
        if (annotations.isEmpty()) {
            return null;
        }
        Annotation annotation = annotations.iterator().next();
        return getAnnotationXml(annotation.getImage(), squareSize,
                                rectangleRepository.findByImageIdAndSquareSize
                                (imageId, squareSize), true);
    }

    /**
     * GET  /rectangles/xml/{squareSize}/all : get all the rectangles XML with specified squareSize
     *
     * @param squareSize squareSize
     * @return the AnnotationXml Zip with status 200 (OK)
     */
    @GetMapping(value="/rectangles/xml/{squareSize}/all", produces="application/zip")
    @Timed
    public void getAllAnnotationXml(HttpServletResponse resonse,
                                    @PathVariable Integer squareSize)
        throws IOException, JAXBException {
        log.debug("REST request to get all AnnotationXml with squareSize:{}",
                  squareSize);
        resonse.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                          "attachment;filename=annotations.zip");
        resonse.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        ZipOutputStream zos = new ZipOutputStream(resonse.getOutputStream());
        JAXBContext context = JAXBContext.newInstance(AnnotationXml.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
        imageRepository.findAll()
            .parallelStream()
            .map(image -> getImageAnnotationXml(image.getId(), squareSize))
            .filter(xml -> xml != null)
            .sequential()
            .forEach(xml -> {
                    try {
                        zos.putNextEntry
                            (new ZipEntry(xml.filename()
                                          .replace(".jpg", ".xml")));
                        marshaller.marshal(xml, zos);
                    } catch (IOException | JAXBException e) {
                        log.error("IO/JAXB Exception occurred. filename:{}",
                                  xml.filename(), e);
                    }
                });
        zos.flush();
        zos.close();
    }

    private AnnotationXml getAnnotationXml(Image image, int squareSize,
                                           Set<Rectangle> rectangles,
                                           boolean withNoAnnotation) {
        if (rectangles.isEmpty()) {
            return null;
        }
        String filename = image.getFilename();
        int index = filename.indexOf("/", 8);
        int lastIndex = filename.lastIndexOf("/");
        String folder = filename;
        if (index > 0 && lastIndex > 0) {
            folder = filename.substring(index, lastIndex);
        }

        int width = image.getWidth();
        int height = image.getHeight();
        double distance = image.getDistance();
        int focalLength = image.getFocalLength();
        double rate = distance * RATE / focalLength / squareSize;
        int columns = (int) Math.round(rate * width);
        int rows = (int) Math.round(rate * height);
        // int columns = 153;
        // int rows = 115;
        double intervalX = width / (double) columns;
        double intervalY = height / (double) rows;
        log.debug("squareSize:{},width:{},distance:{},focalLength:{},rate:{},"
                  + "columns:{},intervalX:{}", squareSize, width, distance,
                  focalLength, rate, columns, intervalX);

        if (withNoAnnotation) {
            Map<String, List<Rectangle>> rectanglesMap =
                rectangles.stream()
                .filter(r -> !r.isPending())
                .collect(Collectors.groupingBy
                         (r -> r.getCoordinateX() + "," + r.getCoordinateY()));
            return createAnnotationXml(folder,
                                       filename.substring(lastIndex + 1),
                                       width, height,
                                       createObjects(rectanglesMap,
                                                     columns, rows,
                                                     intervalX, intervalY));
        }
        return createAnnotationXml(folder, filename.substring(lastIndex + 1),
                                   width, height,
                                   createObjects(rectangles, intervalX,
                                                 intervalY));
    }

    private List<AnnotationXml.Obj> createObjects(Set<Rectangle> rectangles,
                                                  double intervalX,
                                                  double intervalY) {
        return rectangles
            .parallelStream()
            .filter(r -> !r.isPending())
            .map(r -> createAnnotationXmlObj(r, intervalX, intervalY))
            .collect(Collectors.toList());
    }

    private List<AnnotationXml.Obj> createObjects
        (Map<String, List<Rectangle>> rectanglesMap, int columns, int rows,
         double intervalX, double intervalY) {
        return IntStream.range(0, columns)
            .parallel()
            .mapToObj(col -> IntStream.range(0, rows)
                      .mapToObj(row -> Optional.ofNullable
                                (rectanglesMap.get(col + "," + row))
                                .map(l -> l.stream()
                                     .map(r -> createAnnotationXmlObj
                                          (r, intervalX, intervalY))
                                     .collect(Collectors.toList()))
                                .orElse(Collections.singletonList
                                        (createAnnotationXmlObj
                                         ("Unannotated", col, row, intervalX,
                                          intervalY))))
                      .flatMap(Collection::stream)
                      .collect(Collectors.toList()))
            .flatMap(Collection::stream)
            .collect(Collectors.toList());
    }

    private AnnotationXml.Obj
        createAnnotationXmlObj(String name, int coordinateX, int coordinateY,
                               double intervalX, double intervalY) {
        return new AnnotationXml.Obj()
            .name(name)
            .pose("Unspecified")
            .truncated(0)
            .difficult(0)
            .bndbox(new AnnotationXml.Bndbox()
                    .xmin((int) (coordinateX * intervalX))
                    .ymin((int) (coordinateY * intervalY))
                    .xmax((int) ((coordinateX + 1) * intervalX))
                    .ymax((int) ((coordinateY + 1) * intervalY)));
    }

    private AnnotationXml.Obj createAnnotationXmlObj(Rectangle r,
                                                     double intervalX,
                                                     double intervalY) {
        return createAnnotationXmlObj(r.getAnnotation().getDefect().name(),
                                      r.getCoordinateX(), r.getCoordinateY(),
                                      intervalX, intervalY);
    }

    private AnnotationXml createAnnotationXml(String folder, String filename,
                                              int width, int height,
                                              List<AnnotationXml.Obj> objects) {
        return new AnnotationXml()
            .folder(folder)
            .filename(filename)
            .size(new AnnotationXml.Size()
                  .width(width)
                  .height(height)
                  .depth(3))
            .object(objects);
    }
}
