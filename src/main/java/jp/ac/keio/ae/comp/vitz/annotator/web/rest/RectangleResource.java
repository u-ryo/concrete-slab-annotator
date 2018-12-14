package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.ObjectMapper;
import jp.ac.keio.ae.comp.vitz.annotator.config.ApplicationProperties;
import jp.ac.keio.ae.comp.vitz.annotator.domain.AccessLog;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation;
import jp.ac.keio.ae.comp.vitz.annotator.domain.AnnotationXml;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Image;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Rectangle;
import jp.ac.keio.ae.comp.vitz.annotator.domain.User;
import jp.ac.keio.ae.comp.vitz.annotator.domain.enumeration.DefectName;

import jp.ac.keio.ae.comp.vitz.annotator.repository.AccessLogRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.AnnotationRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.ImageRepository;
import jp.ac.keio.ae.comp.vitz.annotator.repository.RectangleRepository;
import jp.ac.keio.ae.comp.vitz.annotator.service.UserService;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.errors.BadRequestAlertException;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.im4java.core.ConvertCmd;
import org.im4java.core.IM4JavaException;
import org.im4java.core.IMOperation;
import org.im4java.core.IMOps;
import org.im4java.core.Operation;
import org.im4java.process.Pipe;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
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

    private static final String ENTITY_NAME = "rectangle",
        RED = "rgba(178, 76, 77, 0.4)", GREEN = "rgba(76, 178, 77, 0.4)",
        JPG = "jpg:-";
    private static final ZoneId TOKYO = ZoneId.of("Asia/Tokyo");
    private static final Pageable TOP_TO = new PageRequest(0, 1, DESC, "to");
    private static final int INTERVAL = 5;
    private static final double RATE = 0.46;

    private final AccessLogRepository accessLogRepository;
    private final AnnotationRepository annotationRepository;
    private final ImageRepository imageRepository;
    private final RectangleRepository rectangleRepository;
    private final UserService userService;

    @Autowired
    private ApplicationProperties properties;

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
        // try { java.util.concurrent.TimeUnit.SECONDS.sleep(60); } catch (InterruptedException e) {}
        return rectangleRepository.findByAnnotationId(annotationId).stream()
            .collect(Collectors.toMap
                     (r -> r.getCoordinateX() + "," + r.getCoordinateY(),
                      r -> r, (r1, r2) -> r2));
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
    @Transactional
    public ResponseEntity<Void> saveRectanglesWithAnnotationId
        (@PathVariable Long annotationId,
         @Valid @RequestBody Set<Rectangle> rectangles) {
        log.debug("REST request to save Rectangles with annotationId:{}, {}",
                  annotationId, rectangles);
        // user should be gotten before another thread
        User user = userService.getUserWithAuthorities().orElse(null);
        log.debug("user:{}", user);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // CompletableFuture
        //     .runAsync(() -> saveRectangles(annotationId, rectangles, user));
        saveRectangles(annotationId, rectangles, user);
        return ResponseEntity.status(201).build();
    }

    // private static final java.util.Random RAND = new java.util.Random();
    private void saveRectangles(Long annotationId, Set<Rectangle> rectangles,
                                User user) {
        try {
            // java.util.concurrent.TimeUnit.SECONDS.sleep(RAND.nextInt(10));
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

            List<AccessLog> accessLogs = accessLogRepository
                .findByUserIdAndAnnotationId(user.getId(), annotationId, TOP_TO);
            ZonedDateTime now = ZonedDateTime.now(TOKYO);
            log.debug("accessLogs:{}, isAfter?{}", accessLogs,
                      accessLogs.isEmpty() ? "EMPTY"
                      : accessLogs.get(0).getTo().plusMinutes(INTERVAL)
                      .isBefore(now));
            if (accessLogs.isEmpty()
                || accessLogs.get(0).getTo().plusMinutes(INTERVAL).isBefore(now)) {
                accessLogRepository.save(new AccessLog().from(now).to(now)
                                         .user(user).annotation(annotation));
            } else {
                accessLogRepository.save(accessLogs.get(0).to(now));
            }
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }
    }
    
    /**
     * GET  /rectangles/xml/annotation/{annotationId} : get the rectangles XML which belong to the annotation with the specified annotationId.
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
     * GET  /rectangles/xml/image/{imageId}/{squareSize} : get the rectangles XML which belong to the annotations with the specified imageId.
     *
     * @param imageId imageId of rectangles belong to
     * @param squareSize squareSize
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
        return getAnnotationXml
            (annotation.getImage(), squareSize,
             rectangleRepository
             .findByImageIdAndSquareSize(imageId, squareSize)
             .stream()
             .collect(Collectors.toMap
                      (r -> r.getCoordinateX() + "," + r.getCoordinateY(),
                       r -> r,
                       (r1, r2) -> {
                          // rectangleRepository.delete(r1.getId());
                          return r2;
                      }))
             .values()
             .stream()
             .collect(Collectors.toSet()),
             true);
    }

    /**
     * GET  /rectangles/xml/{squareSize}/all : get all the rectangles XML with specified squareSize
     *
     * @param response injected HttpServletResponse
     * @param squareSize squareSize
     * @return the AnnotationXml Zip with status 200 (OK)
     */
    @GetMapping(value = "/rectangles/xml/{squareSize}/all",
                produces = "application/zip")
    @Timed
    public void getAllAnnotationXml(HttpServletResponse response,
                                    @PathVariable Integer squareSize)
        throws IOException, JAXBException {
        log.debug("REST request to get all AnnotationXml with squareSize:{}",
                  squareSize);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                          "attachment;filename=annotations.zip");
        getAnnotationXmls(response, imageRepository.findAll(), squareSize);
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

        Condition c = getCondition(image, squareSize);

        if (withNoAnnotation) {
            Map<String, List<Rectangle>> rectanglesMap =
                rectangles.stream()
                // .filter(r -> !r.isPending())
                .collect(Collectors.groupingBy
                         (r -> r.getCoordinateX() + "," + r.getCoordinateY()));
            return createAnnotationXml(folder,
                                       filename.substring(lastIndex + 1),
                                       c.width, c.height,
                                       createObjects(rectanglesMap,
                                                     c.columns, c.rows,
                                                     c.intervalX, c.intervalY));
        }
        return createAnnotationXml(folder, filename.substring(lastIndex + 1),
                                   c.width, c.height,
                                   createObjects(rectangles, c.intervalX,
                                                 c.intervalY));
    }

    private List<AnnotationXml.Obj> createObjects(Set<Rectangle> rectangles,
                                                  double intervalX,
                                                  double intervalY) {
        return rectangles
            .parallelStream()
            // .filter(r -> !r.isPending())
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
                                          intervalY, false))))
                      .flatMap(Collection::stream)
                      .collect(Collectors.toList()))
            .flatMap(Collection::stream)
            .collect(Collectors.toList());
    }

    private AnnotationXml.Obj
        createAnnotationXmlObj(String name, int coordinateX, int coordinateY,
                               double intervalX, double intervalY,
                               boolean isPending) {
        return new AnnotationXml.Obj()
            .name(name)
            .pose("Unspecified")
            .truncated(0)
            .difficult(isPending ? 100 : 0)
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
                                      intervalX, intervalY, r.isPending());
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

    /**
     * GET  /rectangles/xml/{squareSize}/{since} : get the rectangles XML with specified squareSize since specified date
     *
     * @param response injected HttpServletResponse
     * @param squareSize squareSize
     * @param since Year Month Date
     * @return the AnnotationXml Zip with status 200 (OK)
     */
    @GetMapping(value = "/rectangles/xml/{squareSize}/{since}",
                produces = "application/zip")
    @Timed
    public void getAnnotationXmlSince(HttpServletResponse response,
                                      @PathVariable Integer squareSize,
                                      @DateTimeFormat(pattern="yyyyMMdd")
                                      @PathVariable LocalDate since)
        throws IOException, JAXBException {
        log.debug("REST request to get all AnnotationXml with squareSize:{} "
                  + "since {}", squareSize, since);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                          "attachment;filename=annotations_" + since + ".zip");
        getAnnotationXmls(response,
                          imageRepository.findSince(since.atStartOfDay(TOKYO)),
                          squareSize);
    }

    private void getAnnotationXmls(HttpServletResponse response,
                                   List<Image> images, int squareSize)
        throws IOException, JAXBException {
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        try (ZipOutputStream zos = new ZipOutputStream
             (new BufferedOutputStream(response.getOutputStream()))) {
            JAXBContext context = JAXBContext.newInstance(AnnotationXml.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            images.parallelStream()
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
        }
    }

    /**
     * GET /rectangles/compare/{annotationId}/{imageId}/{defect} :
     * get compared annotation image with specified squareSize, annotationId
     * and imageId with defect
     *
     * @param response injected HttpServletResponse
     * @param annotationId annotationId to be compared
     * @param imageId imageId for specifying annotation id
     * @param defect defect for specifying annotation id
     * @return jpg image with annotations by annotationId(red) and by imageId/defect(green)
     */
    @GetMapping(value = "/rectangles/compare/{annotationId}/{imageId}/{defect}",
                produces = MediaType.IMAGE_JPEG_VALUE)
    @Timed
    public void getComparedJpg(HttpServletResponse response,
                               @PathVariable Long annotationId,
                               @PathVariable Long imageId,
                               @PathVariable DefectName defect)
        throws IOException, JAXBException {
        log.debug("REST request to get a compared image with annotationId:{}, "
                  + "imageId:{}, defect:{}", annotationId, imageId, defect);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                          "attachment;filename=compare_" + annotationId + "_"
                           + imageId + "_" + defect + ".jpg");
        response.setContentType(MediaType.IMAGE_JPEG_VALUE);
        Annotation annotation = annotationRepository.findOne(annotationId);
        Condition c = getCondition(annotation);
        IMOps op =
            ((IMOperation) new IMOperation()
             .addImage(annotation.getImage().getFilename()
                       .replace(properties.getImageURLOrig(),
                                properties.getImageURLReplace())));
        drawRectanglesIM4Java
            (rectangleRepository.findByAnnotationId(annotationId), RED, op,
             c.intervalX, c.intervalY);

        drawRectanglesIM4Java
            (rectangleRepository.findByImageIdAndSquareSizeAndDefectName
             (imageId, c.squareSize, defect), GREEN, op,
             c.intervalX, c.intervalY);

        BufferedOutputStream stream =
            new BufferedOutputStream (response.getOutputStream());
        ConvertCmd cmd = new ConvertCmd();
        cmd.setOutputConsumer(new Pipe(null, stream));
        try {
            cmd.run(op.addImage(JPG));
        } catch (InterruptedException | IM4JavaException e) {
            log.error("op({}) was interrupted.", op, e);
        }
        // cmd.createScript("/tmp/im4java.sh", op);
        stream.flush();
    }

    private Condition getCondition(Annotation annotation) {
        return getCondition(annotation.getImage(), annotation.getSquareSize());
    }

    private Condition getCondition(Image image, int squareSize) {
        Condition c = new Condition();
        c.squareSize = squareSize;
        c.width = image.getWidth();
        c.height = image.getHeight();
        int focalLength = image.getFocalLength();
        double distance = image.getDistance(),
            rate = distance * RATE / focalLength / c.squareSize;
        c.columns = (int) Math.round(rate * c.width);
        c.rows = (int) Math.round(rate * c.height);
        // int columns = 153;
        // int rows = 115;
        c.intervalX = c.width / (double) c.columns;
        c.intervalY = c.height / (double) c.rows;
        log.debug("columns:{},rows:{},intervalX:{},intervalY:{}",
                  c.columns, c.rows, c.intervalX, c.intervalY);
        return c;
    }

    class Condition {
        int squareSize, width, height, columns, rows;
        double intervalX, intervalY;
    }

    private void drawRectanglesIM4Java(Set<Rectangle> rectangles, String color,
                                       IMOps op,
                                       double intervalX, double intervalY) {
        op.fill(color).stroke(color);
        rectangles.stream()
            .forEach(r -> op.draw
                     (String.format
                      ("rectangle %d, %d, %d, %d",
                       (int) (r.getCoordinateX() * intervalX),
                       (int) (r.getCoordinateY() * intervalY),
                       (int) (r.getCoordinateX() * intervalX + intervalX),
                       (int) (r.getCoordinateY() * intervalY + intervalY))));
    }

    /**
     * GET /rectangles/compare/{annotationId}/{imageId}/{defect} :
     * get a confusion matrix with specified squareSize, annotationId
     * and imageId with defect
     *
     * @param annotationId annotationId to be compared
     * @param imageId imageId for specifying annotation id
     * @param defect defect for specifying annotation id
     * @return csv with a confusion matrix
     */
    @GetMapping(value = "/rectangles/confusionmatrix/{annotationId}/{imageId}/{defect}",
                produces = "text/csv")
    @Timed
    public String getConfusionMatrix(@PathVariable Long annotationId,
                                     @PathVariable Long imageId,
                                     @PathVariable DefectName defect)
        throws IOException {
        log.debug("REST request to get a confusion matrix with annotationId:{},"
                  + " imageId:{}, defect:{}", annotationId, imageId, defect);
        Annotation annotation = annotationRepository.findOne(annotationId);
        Set<String> base = new HashSet<>
            (rectangleRepository.findByAnnotationId(annotationId).stream()
             .map(r -> String.format("%s,%s", r.getCoordinateX(),
                                     r.getCoordinateY()))
             .collect(Collectors.toList()));
        Set<String> target = new HashSet<>
            (rectangleRepository.findByImageIdAndSquareSizeAndDefectName
             (imageId, annotation.getSquareSize(), defect).stream()
             .map(r -> String.format("%s,%s", r.getCoordinateX(),
                                     r.getCoordinateY()))
             .collect(Collectors.toList()));
        Set<String> truePositive = new HashSet<>(base);
        truePositive.retainAll(target);
        Set<String> falseNegative = new HashSet<>(base);
        falseNegative.removeAll(target);
        Set<String> falsePositive = new HashSet<>(target);
        falsePositive.removeAll(base);

        Condition c = getCondition(annotation);
        Image targetImage = imageRepository.findOne(imageId);

        String result = String.format
            ("target:%s%nbase:%s,%d,%d%n,%d,%d%n,precision,%f%n,recall,%f%n"
             + ",f-measure,%f%n", targetImage.getFilename(),
             annotation.getImage().getFilename(),
             truePositive.size(), falseNegative.size(),
             falsePositive.size(),
             c.columns * c.rows - falseNegative.size() - falsePositive.size()
             - truePositive.size(),
             truePositive.size() / (double) target.size(),
             truePositive.size() / (double) base.size(),
             (2 * truePositive.size()) / (double) (base.size() + target.size()));
        log.debug("confusion matrix:{}", result);
        return result;
    }
}
