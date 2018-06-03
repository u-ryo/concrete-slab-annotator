package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import jp.ac.keio.ae.comp.vitz.annotator.ConcreteSlabAnnotatorApp;

import jp.ac.keio.ae.comp.vitz.annotator.domain.Annotation;
import jp.ac.keio.ae.comp.vitz.annotator.repository.AnnotationRepository;
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
import java.util.List;

import static jp.ac.keio.ae.comp.vitz.annotator.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jp.ac.keio.ae.comp.vitz.annotator.domain.enumeration.DefectName;
/**
 * Test class for the AnnotationResource REST controller.
 *
 * @see AnnotationResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = ConcreteSlabAnnotatorApp.class)
public class AnnotationResourceIntTest {

    private static final Integer DEFAULT_SQUARE_SIZE = 1;
    private static final Integer UPDATED_SQUARE_SIZE = 2;

    private static final DefectName DEFAULT_DEFECT = DefectName.CRACK;
    private static final DefectName UPDATED_DEFECT = DefectName.EFFLORESCENCE;

    @Autowired
    private AnnotationRepository annotationRepository;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restAnnotationMockMvc;

    private Annotation annotation;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AnnotationResource annotationResource = new AnnotationResource(annotationRepository);
        this.restAnnotationMockMvc = MockMvcBuilders.standaloneSetup(annotationResource)
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
    public static Annotation createEntity(EntityManager em) {
        Annotation annotation = new Annotation()
            .squareSize(DEFAULT_SQUARE_SIZE)
            .defect(DEFAULT_DEFECT);
        return annotation;
    }

    @Before
    public void initTest() {
        annotation = createEntity(em);
    }

    @Test
    @Transactional
    public void createAnnotation() throws Exception {
        int databaseSizeBeforeCreate = annotationRepository.findAll().size();

        // Create the Annotation
        restAnnotationMockMvc.perform(post("/api/annotations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotation)))
            .andExpect(status().isCreated());

        // Validate the Annotation in the database
        List<Annotation> annotationList = annotationRepository.findAll();
        assertThat(annotationList).hasSize(databaseSizeBeforeCreate + 1);
        Annotation testAnnotation = annotationList.get(annotationList.size() - 1);
        assertThat(testAnnotation.getSquareSize()).isEqualTo(DEFAULT_SQUARE_SIZE);
        assertThat(testAnnotation.getDefect()).isEqualTo(DEFAULT_DEFECT);
    }

    @Test
    @Transactional
    public void createAnnotationWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = annotationRepository.findAll().size();

        // Create the Annotation with an existing ID
        annotation.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAnnotationMockMvc.perform(post("/api/annotations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotation)))
            .andExpect(status().isBadRequest());

        // Validate the Annotation in the database
        List<Annotation> annotationList = annotationRepository.findAll();
        assertThat(annotationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkSquareSizeIsRequired() throws Exception {
        int databaseSizeBeforeTest = annotationRepository.findAll().size();
        // set the field null
        annotation.setSquareSize(null);

        // Create the Annotation, which fails.

        restAnnotationMockMvc.perform(post("/api/annotations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotation)))
            .andExpect(status().isBadRequest());

        List<Annotation> annotationList = annotationRepository.findAll();
        assertThat(annotationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkDefectIsRequired() throws Exception {
        int databaseSizeBeforeTest = annotationRepository.findAll().size();
        // set the field null
        annotation.setDefect(null);

        // Create the Annotation, which fails.

        restAnnotationMockMvc.perform(post("/api/annotations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotation)))
            .andExpect(status().isBadRequest());

        List<Annotation> annotationList = annotationRepository.findAll();
        assertThat(annotationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllAnnotations() throws Exception {
        // Initialize the database
        annotationRepository.saveAndFlush(annotation);

        // Get all the annotationList
        restAnnotationMockMvc.perform(get("/api/annotations?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(annotation.getId().intValue())))
            .andExpect(jsonPath("$.[*].squareSize").value(hasItem(DEFAULT_SQUARE_SIZE)))
            .andExpect(jsonPath("$.[*].defect").value(hasItem(DEFAULT_DEFECT.toString())));
    }

    @Test
    @Transactional
    public void getAnnotation() throws Exception {
        // Initialize the database
        annotationRepository.saveAndFlush(annotation);

        // Get the annotation
        restAnnotationMockMvc.perform(get("/api/annotations/{id}", annotation.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(annotation.getId().intValue()))
            .andExpect(jsonPath("$.squareSize").value(DEFAULT_SQUARE_SIZE))
            .andExpect(jsonPath("$.defect").value(DEFAULT_DEFECT.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingAnnotation() throws Exception {
        // Get the annotation
        restAnnotationMockMvc.perform(get("/api/annotations/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAnnotation() throws Exception {
        // Initialize the database
        annotationRepository.saveAndFlush(annotation);
        int databaseSizeBeforeUpdate = annotationRepository.findAll().size();

        // Update the annotation
        Annotation updatedAnnotation = annotationRepository.findOne(annotation.getId());
        // Disconnect from session so that the updates on updatedAnnotation are not directly saved in db
        em.detach(updatedAnnotation);
        updatedAnnotation
            .squareSize(UPDATED_SQUARE_SIZE)
            .defect(UPDATED_DEFECT);

        restAnnotationMockMvc.perform(put("/api/annotations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedAnnotation)))
            .andExpect(status().isOk());

        // Validate the Annotation in the database
        List<Annotation> annotationList = annotationRepository.findAll();
        assertThat(annotationList).hasSize(databaseSizeBeforeUpdate);
        Annotation testAnnotation = annotationList.get(annotationList.size() - 1);
        assertThat(testAnnotation.getSquareSize()).isEqualTo(UPDATED_SQUARE_SIZE);
        assertThat(testAnnotation.getDefect()).isEqualTo(UPDATED_DEFECT);
    }

    @Test
    @Transactional
    public void updateNonExistingAnnotation() throws Exception {
        int databaseSizeBeforeUpdate = annotationRepository.findAll().size();

        // Create the Annotation

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restAnnotationMockMvc.perform(put("/api/annotations")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(annotation)))
            .andExpect(status().isCreated());

        // Validate the Annotation in the database
        List<Annotation> annotationList = annotationRepository.findAll();
        assertThat(annotationList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteAnnotation() throws Exception {
        // Initialize the database
        annotationRepository.saveAndFlush(annotation);
        int databaseSizeBeforeDelete = annotationRepository.findAll().size();

        // Get the annotation
        restAnnotationMockMvc.perform(delete("/api/annotations/{id}", annotation.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Annotation> annotationList = annotationRepository.findAll();
        assertThat(annotationList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Annotation.class);
        Annotation annotation1 = new Annotation();
        annotation1.setId(1L);
        Annotation annotation2 = new Annotation();
        annotation2.setId(annotation1.getId());
        assertThat(annotation1).isEqualTo(annotation2);
        annotation2.setId(2L);
        assertThat(annotation1).isNotEqualTo(annotation2);
        annotation1.setId(null);
        assertThat(annotation1).isNotEqualTo(annotation2);
    }
}
