package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jp.ac.keio.ae.comp.vitz.annotator.domain.AccessLog;
import jp.ac.keio.ae.comp.vitz.annotator.domain.AccessLogBean;

import jp.ac.keio.ae.comp.vitz.annotator.repository.AccessLogRepository;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.errors.BadRequestAlertException;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.validation.Valid;

/**
 * REST controller for managing AccessLog.
 */
@RestController
@RequestMapping("/api")
public class AccessLogResource {

    private final Logger log = LoggerFactory.getLogger(AccessLogResource.class);

    private static final String ENTITY_NAME = "accessLog";
    private static final DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    private final AccessLogRepository accessLogRepository;

    public AccessLogResource(AccessLogRepository accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }

    /**
     * POST  /access-logs : Create a new accessLog.
     *
     * @param accessLog the accessLog to create
     * @return the ResponseEntity with status 201 (Created) and with body the new accessLog, or with status 400 (Bad Request) if the accessLog has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    // @PostMapping("/access-logs")
    @Timed
    public ResponseEntity<AccessLog> createAccessLog(@Valid @RequestBody AccessLog accessLog) throws URISyntaxException {
        log.debug("REST request to save AccessLog : {}", accessLog);
        if (accessLog.getId() != null) {
            throw new BadRequestAlertException("A new accessLog cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AccessLog result = accessLogRepository.save(accessLog);
        return ResponseEntity.created(new URI("/api/access-logs/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /access-logs : Updates an existing accessLog.
     *
     * @param accessLog the accessLog to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated accessLog,
     * or with status 400 (Bad Request) if the accessLog is not valid,
     * or with status 500 (Internal Server Error) if the accessLog couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    // @PutMapping("/access-logs")
    @Timed
    public ResponseEntity<AccessLog> updateAccessLog(@Valid @RequestBody AccessLog accessLog) throws URISyntaxException {
        log.debug("REST request to update AccessLog : {}", accessLog);
        if (accessLog.getId() == null) {
            return createAccessLog(accessLog);
        }
        AccessLog result = accessLogRepository.save(accessLog);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, accessLog.getId().toString()))
            .body(result);
    }

    /**
     * GET  /access-logs : get all the accessLogs.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of accessLogs in body
     */
    // @GetMapping("/access-logs")
    @Timed
    public List<AccessLog> getAllAccessLogs() {
        log.debug("REST request to get all AccessLogs");
        return accessLogRepository.findAll();
    }

    /**
     * GET  /access-logs/:id : get the "id" accessLog.
     *
     * @param id the id of the accessLog to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the accessLog, or with status 404 (Not Found)
     */
    // @GetMapping("/access-logs/{id}")
    @Timed
    public ResponseEntity<AccessLog> getAccessLog(@PathVariable Long id) {
        log.debug("REST request to get AccessLog : {}", id);
        AccessLog accessLog = accessLogRepository.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(accessLog));
    }

    /**
     * DELETE  /access-logs/:id : delete the "id" accessLog.
     *
     * @param id the id of the accessLog to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    // @DeleteMapping("/access-logs/{id}")
    @Timed
    public ResponseEntity<Void> deleteAccessLog(@PathVariable Long id) {
        log.debug("REST request to delete AccessLog : {}", id);
        accessLogRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * GET  /access-logs/csv : get all the accessLogs with CSV.
     * ref. https://qiita.com/yo1000/items/050c5c47daabf7a10e10
     *
     * @return the CSV File
     */
    @GetMapping(value = "/access-logs/csv",
                produces = MediaType.APPLICATION_OCTET_STREAM_VALUE
                + "; charset=Shift_JIS; Content-Disposition: attachment")
    @ResponseBody
    @Timed
    public Object getAllAccessLogsWithCsv() throws JsonProcessingException {
        log.debug("REST request to get all AccessLogs with CSV");
        List<AccessLogBean> accessLogs = accessLogRepository.findAll().stream()
            .map(a -> new AccessLogBean()
                 .login(a.getUser().getLogin())
                 .filename(a.getAnnotation().getImage().getFilename())
                 .defect(a.getAnnotation().getDefect().name())
                 .squareSize(a.getAnnotation().getSquareSize())
                 .from(formatter.format(a.getFrom()))
                 .to(formatter.format(a.getTo())))
            .collect(Collectors.toList());
        CsvMapper mapper = new CsvMapper();
        CsvSchema schema = mapper.schemaFor(AccessLogBean.class).withHeader();
        // https://stackoverflow.com/questions/39086472/jackson-serializes-a-zoneddatetime-wrongly-in-spring-boot?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
        mapper.registerModule(new JavaTimeModule());
        return mapper.writer(schema).writeValueAsString(accessLogs);
    }
}
