package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import jp.ac.keio.ae.comp.vitz.annotator.ConcreteSlabAnnotatorApp;

import jp.ac.keio.ae.comp.vitz.annotator.domain.AccessLog;
import jp.ac.keio.ae.comp.vitz.annotator.domain.User;
import jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation;
import jp.ac.keio.ae.comp.vitz.annotator.repository.AccessLogRepository;
import jp.ac.keio.ae.comp.vitz.annotator.web.rest.errors.ExceptionTranslator;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.ZoneId;
import java.util.List;

import static jp.ac.keio.ae.comp.vitz.annotator.web.rest.TestUtil.sameInstant;
import static jp.ac.keio.ae.comp.vitz.annotator.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the AccessLogResource REST controller.
 *
 * @see AccessLogResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = ConcreteSlabAnnotatorApp.class)
public class AccessLogResourceIntTest {

    private static final ZonedDateTime DEFAULT_FROM = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_FROM = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final ZonedDateTime DEFAULT_TO = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_TO = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    @Autowired
    private AccessLogRepository accessLogRepository;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restAccessLogMockMvc;

    private AccessLog accessLog;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AccessLogResource accessLogResource = new AccessLogResource(accessLogRepository);
        this.restAccessLogMockMvc = MockMvcBuilders.standaloneSetup(accessLogResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AccessLog createEntity(EntityManager em) {
        AccessLog accessLog = new AccessLog()
            .from(DEFAULT_FROM)
            .to(DEFAULT_TO);
        // Add required entity
        User user = UserResourceIntTest.createEntity(em);
        em.persist(user);
        em.flush();
        accessLog.setUser(user);
        // Add required entity
        Annotation annotation = AnnotationResourceIntTest.createEntity(em);
        em.persist(annotation);
        em.flush();
        accessLog.setAnnotation(annotation);
        return accessLog;
    }

    @Before
    public void initTest() {
        accessLog = createEntity(em);
    }

    @Test
    @Transactional
    public void createAccessLog() throws Exception {
        int databaseSizeBeforeCreate = accessLogRepository.findAll().size();

        // Create the AccessLog
        restAccessLogMockMvc.perform(post("/api/access-logs")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(accessLog)))
            .andExpect(status().isCreated());

        // Validate the AccessLog in the database
        List<AccessLog> accessLogList = accessLogRepository.findAll();
        assertThat(accessLogList).hasSize(databaseSizeBeforeCreate + 1);
        AccessLog testAccessLog = accessLogList.get(accessLogList.size() - 1);
        assertThat(testAccessLog.getFrom()).isEqualTo(DEFAULT_FROM);
        assertThat(testAccessLog.getTo()).isEqualTo(DEFAULT_TO);
    }

    @Test
    @Transactional
    public void createAccessLogWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = accessLogRepository.findAll().size();

        // Create the AccessLog with an existing ID
        accessLog.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAccessLogMockMvc.perform(post("/api/access-logs")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(accessLog)))
            .andExpect(status().isBadRequest());

        // Validate the AccessLog in the database
        List<AccessLog> accessLogList = accessLogRepository.findAll();
        assertThat(accessLogList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkFromIsRequired() throws Exception {
        int databaseSizeBeforeTest = accessLogRepository.findAll().size();
        // set the field null
        accessLog.setFrom(null);

        // Create the AccessLog, which fails.

        restAccessLogMockMvc.perform(post("/api/access-logs")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(accessLog)))
            .andExpect(status().isBadRequest());

        List<AccessLog> accessLogList = accessLogRepository.findAll();
        assertThat(accessLogList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkToIsRequired() throws Exception {
        int databaseSizeBeforeTest = accessLogRepository.findAll().size();
        // set the field null
        accessLog.setTo(null);

        // Create the AccessLog, which fails.

        restAccessLogMockMvc.perform(post("/api/access-logs")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(accessLog)))
            .andExpect(status().isBadRequest());

        List<AccessLog> accessLogList = accessLogRepository.findAll();
        assertThat(accessLogList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllAccessLogs() throws Exception {
        // Initialize the database
        accessLogRepository.saveAndFlush(accessLog);

        // Get all the accessLogList
        restAccessLogMockMvc.perform(get("/api/access-logs?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(accessLog.getId().intValue())))
            .andExpect(jsonPath("$.[*].from").value(hasItem(sameInstant(DEFAULT_FROM))))
            .andExpect(jsonPath("$.[*].to").value(hasItem(sameInstant(DEFAULT_TO))));
    }

    @Test
    @Transactional
    public void getAccessLog() throws Exception {
        // Initialize the database
        accessLogRepository.saveAndFlush(accessLog);

        // Get the accessLog
        restAccessLogMockMvc.perform(get("/api/access-logs/{id}", accessLog.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(accessLog.getId().intValue()))
            .andExpect(jsonPath("$.from").value(sameInstant(DEFAULT_FROM)))
            .andExpect(jsonPath("$.to").value(sameInstant(DEFAULT_TO)));
    }

    @Test
    @Transactional
    public void getNonExistingAccessLog() throws Exception {
        // Get the accessLog
        restAccessLogMockMvc.perform(get("/api/access-logs/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAccessLog() throws Exception {
        // Initialize the database
        accessLogRepository.saveAndFlush(accessLog);
        int databaseSizeBeforeUpdate = accessLogRepository.findAll().size();

        // Update the accessLog
        AccessLog updatedAccessLog = accessLogRepository.findOne(accessLog.getId());
        // Disconnect from session so that the updates on updatedAccessLog are not directly saved in db
        em.detach(updatedAccessLog);
        updatedAccessLog
            .from(UPDATED_FROM)
            .to(UPDATED_TO);

        restAccessLogMockMvc.perform(put("/api/access-logs")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedAccessLog)))
            .andExpect(status().isOk());

        // Validate the AccessLog in the database
        List<AccessLog> accessLogList = accessLogRepository.findAll();
        assertThat(accessLogList).hasSize(databaseSizeBeforeUpdate);
        AccessLog testAccessLog = accessLogList.get(accessLogList.size() - 1);
        assertThat(testAccessLog.getFrom()).isEqualTo(UPDATED_FROM);
        assertThat(testAccessLog.getTo()).isEqualTo(UPDATED_TO);
    }

    @Test
    @Transactional
    public void updateNonExistingAccessLog() throws Exception {
        int databaseSizeBeforeUpdate = accessLogRepository.findAll().size();

        // Create the AccessLog

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restAccessLogMockMvc.perform(put("/api/access-logs")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(accessLog)))
            .andExpect(status().isCreated());

        // Validate the AccessLog in the database
        List<AccessLog> accessLogList = accessLogRepository.findAll();
        assertThat(accessLogList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteAccessLog() throws Exception {
        // Initialize the database
        accessLogRepository.saveAndFlush(accessLog);
        int databaseSizeBeforeDelete = accessLogRepository.findAll().size();

        // Get the accessLog
        restAccessLogMockMvc.perform(delete("/api/access-logs/{id}", accessLog.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<AccessLog> accessLogList = accessLogRepository.findAll();
        assertThat(accessLogList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AccessLog.class);
        AccessLog accessLog1 = new AccessLog();
        accessLog1.setId(1L);
        AccessLog accessLog2 = new AccessLog();
        accessLog2.setId(accessLog1.getId());
        assertThat(accessLog1).isEqualTo(accessLog2);
        accessLog2.setId(2L);
        assertThat(accessLog1).isNotEqualTo(accessLog2);
        accessLog1.setId(null);
        assertThat(accessLog1).isNotEqualTo(accessLog2);
    }
}
