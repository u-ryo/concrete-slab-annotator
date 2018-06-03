package jp.ac.keio.ae.comp.vitz.annotator.web.rest;

import jp.ac.keio.ae.comp.vitz.annotator.ConcreteSlabAnnotatorApp;

import jp.ac.keio.ae.comp.vitz.annotator.domain.Rectangle;
import jp.ac.keio.ae.comp.vitz.annotator.repository.RectangleRepository;
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

/**
 * Test class for the RectangleResource REST controller.
 *
 * @see RectangleResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = ConcreteSlabAnnotatorApp.class)
public class RectangleResourceIntTest {

    private static final Integer DEFAULT_X = 1;
    private static final Integer UPDATED_X = 2;

    private static final Integer DEFAULT_Y = 1;
    private static final Integer UPDATED_Y = 2;

    private static final Integer DEFAULT_WIDTH = 1;
    private static final Integer UPDATED_WIDTH = 2;

    private static final Integer DEFAULT_HEIGHT = 1;
    private static final Integer UPDATED_HEIGHT = 2;

    private static final Integer DEFAULT_COORDINATE_X = 1;
    private static final Integer UPDATED_COORDINATE_X = 2;

    private static final Integer DEFAULT_COORDINATE_Y = 1;
    private static final Integer UPDATED_COORDINATE_Y = 2;

    private static final Boolean DEFAULT_PENDING = false;
    private static final Boolean UPDATED_PENDING = true;

    private static final String DEFAULT_COMMENT = "AAAAAAAAAA";
    private static final String UPDATED_COMMENT = "BBBBBBBBBB";

    @Autowired
    private RectangleRepository rectangleRepository;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    private MockMvc restRectangleMockMvc;

    private Rectangle rectangle;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final RectangleResource rectangleResource = new RectangleResource(rectangleRepository);
        this.restRectangleMockMvc = MockMvcBuilders.standaloneSetup(rectangleResource)
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
    public static Rectangle createEntity(EntityManager em) {
        Rectangle rectangle = new Rectangle()
            .x(DEFAULT_X)
            .y(DEFAULT_Y)
            .width(DEFAULT_WIDTH)
            .height(DEFAULT_HEIGHT)
            .coordinateX(DEFAULT_COORDINATE_X)
            .coordinateY(DEFAULT_COORDINATE_Y)
            .pending(DEFAULT_PENDING)
            .comment(DEFAULT_COMMENT);
        return rectangle;
    }

    @Before
    public void initTest() {
        rectangle = createEntity(em);
    }

    @Test
    @Transactional
    public void createRectangle() throws Exception {
        int databaseSizeBeforeCreate = rectangleRepository.findAll().size();

        // Create the Rectangle
        restRectangleMockMvc.perform(post("/api/rectangles")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(rectangle)))
            .andExpect(status().isCreated());

        // Validate the Rectangle in the database
        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeCreate + 1);
        Rectangle testRectangle = rectangleList.get(rectangleList.size() - 1);
        assertThat(testRectangle.getX()).isEqualTo(DEFAULT_X);
        assertThat(testRectangle.getY()).isEqualTo(DEFAULT_Y);
        assertThat(testRectangle.getWidth()).isEqualTo(DEFAULT_WIDTH);
        assertThat(testRectangle.getHeight()).isEqualTo(DEFAULT_HEIGHT);
        assertThat(testRectangle.getCoordinateX()).isEqualTo(DEFAULT_COORDINATE_X);
        assertThat(testRectangle.getCoordinateY()).isEqualTo(DEFAULT_COORDINATE_Y);
        assertThat(testRectangle.isPending()).isEqualTo(DEFAULT_PENDING);
        assertThat(testRectangle.getComment()).isEqualTo(DEFAULT_COMMENT);
    }

    @Test
    @Transactional
    public void createRectangleWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = rectangleRepository.findAll().size();

        // Create the Rectangle with an existing ID
        rectangle.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restRectangleMockMvc.perform(post("/api/rectangles")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(rectangle)))
            .andExpect(status().isBadRequest());

        // Validate the Rectangle in the database
        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkXIsRequired() throws Exception {
        int databaseSizeBeforeTest = rectangleRepository.findAll().size();
        // set the field null
        rectangle.setX(null);

        // Create the Rectangle, which fails.

        restRectangleMockMvc.perform(post("/api/rectangles")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(rectangle)))
            .andExpect(status().isBadRequest());

        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkYIsRequired() throws Exception {
        int databaseSizeBeforeTest = rectangleRepository.findAll().size();
        // set the field null
        rectangle.setY(null);

        // Create the Rectangle, which fails.

        restRectangleMockMvc.perform(post("/api/rectangles")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(rectangle)))
            .andExpect(status().isBadRequest());

        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkWidthIsRequired() throws Exception {
        int databaseSizeBeforeTest = rectangleRepository.findAll().size();
        // set the field null
        rectangle.setWidth(null);

        // Create the Rectangle, which fails.

        restRectangleMockMvc.perform(post("/api/rectangles")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(rectangle)))
            .andExpect(status().isBadRequest());

        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkHeightIsRequired() throws Exception {
        int databaseSizeBeforeTest = rectangleRepository.findAll().size();
        // set the field null
        rectangle.setHeight(null);

        // Create the Rectangle, which fails.

        restRectangleMockMvc.perform(post("/api/rectangles")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(rectangle)))
            .andExpect(status().isBadRequest());

        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllRectangles() throws Exception {
        // Initialize the database
        rectangleRepository.saveAndFlush(rectangle);

        // Get all the rectangleList
        restRectangleMockMvc.perform(get("/api/rectangles?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(rectangle.getId().intValue())))
            .andExpect(jsonPath("$.[*].x").value(hasItem(DEFAULT_X)))
            .andExpect(jsonPath("$.[*].y").value(hasItem(DEFAULT_Y)))
            .andExpect(jsonPath("$.[*].width").value(hasItem(DEFAULT_WIDTH)))
            .andExpect(jsonPath("$.[*].height").value(hasItem(DEFAULT_HEIGHT)))
            .andExpect(jsonPath("$.[*].coordinateX").value(hasItem(DEFAULT_COORDINATE_X)))
            .andExpect(jsonPath("$.[*].coordinateY").value(hasItem(DEFAULT_COORDINATE_Y)))
            .andExpect(jsonPath("$.[*].pending").value(hasItem(DEFAULT_PENDING.booleanValue())))
            .andExpect(jsonPath("$.[*].comment").value(hasItem(DEFAULT_COMMENT.toString())));
    }

    @Test
    @Transactional
    public void getRectangle() throws Exception {
        // Initialize the database
        rectangleRepository.saveAndFlush(rectangle);

        // Get the rectangle
        restRectangleMockMvc.perform(get("/api/rectangles/{id}", rectangle.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(rectangle.getId().intValue()))
            .andExpect(jsonPath("$.x").value(DEFAULT_X))
            .andExpect(jsonPath("$.y").value(DEFAULT_Y))
            .andExpect(jsonPath("$.width").value(DEFAULT_WIDTH))
            .andExpect(jsonPath("$.height").value(DEFAULT_HEIGHT))
            .andExpect(jsonPath("$.coordinateX").value(DEFAULT_COORDINATE_X))
            .andExpect(jsonPath("$.coordinateY").value(DEFAULT_COORDINATE_Y))
            .andExpect(jsonPath("$.pending").value(DEFAULT_PENDING.booleanValue()))
            .andExpect(jsonPath("$.comment").value(DEFAULT_COMMENT.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingRectangle() throws Exception {
        // Get the rectangle
        restRectangleMockMvc.perform(get("/api/rectangles/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateRectangle() throws Exception {
        // Initialize the database
        rectangleRepository.saveAndFlush(rectangle);
        int databaseSizeBeforeUpdate = rectangleRepository.findAll().size();

        // Update the rectangle
        Rectangle updatedRectangle = rectangleRepository.findOne(rectangle.getId());
        // Disconnect from session so that the updates on updatedRectangle are not directly saved in db
        em.detach(updatedRectangle);
        updatedRectangle
            .x(UPDATED_X)
            .y(UPDATED_Y)
            .width(UPDATED_WIDTH)
            .height(UPDATED_HEIGHT)
            .coordinateX(UPDATED_COORDINATE_X)
            .coordinateY(UPDATED_COORDINATE_Y)
            .pending(UPDATED_PENDING)
            .comment(UPDATED_COMMENT);

        restRectangleMockMvc.perform(put("/api/rectangles")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedRectangle)))
            .andExpect(status().isOk());

        // Validate the Rectangle in the database
        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeUpdate);
        Rectangle testRectangle = rectangleList.get(rectangleList.size() - 1);
        assertThat(testRectangle.getX()).isEqualTo(UPDATED_X);
        assertThat(testRectangle.getY()).isEqualTo(UPDATED_Y);
        assertThat(testRectangle.getWidth()).isEqualTo(UPDATED_WIDTH);
        assertThat(testRectangle.getHeight()).isEqualTo(UPDATED_HEIGHT);
        assertThat(testRectangle.getCoordinateX()).isEqualTo(UPDATED_COORDINATE_X);
        assertThat(testRectangle.getCoordinateY()).isEqualTo(UPDATED_COORDINATE_Y);
        assertThat(testRectangle.isPending()).isEqualTo(UPDATED_PENDING);
        assertThat(testRectangle.getComment()).isEqualTo(UPDATED_COMMENT);
    }

    @Test
    @Transactional
    public void updateNonExistingRectangle() throws Exception {
        int databaseSizeBeforeUpdate = rectangleRepository.findAll().size();

        // Create the Rectangle

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restRectangleMockMvc.perform(put("/api/rectangles")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(rectangle)))
            .andExpect(status().isCreated());

        // Validate the Rectangle in the database
        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteRectangle() throws Exception {
        // Initialize the database
        rectangleRepository.saveAndFlush(rectangle);
        int databaseSizeBeforeDelete = rectangleRepository.findAll().size();

        // Get the rectangle
        restRectangleMockMvc.perform(delete("/api/rectangles/{id}", rectangle.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Rectangle> rectangleList = rectangleRepository.findAll();
        assertThat(rectangleList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Rectangle.class);
        Rectangle rectangle1 = new Rectangle();
        rectangle1.setId(1L);
        Rectangle rectangle2 = new Rectangle();
        rectangle2.setId(rectangle1.getId());
        assertThat(rectangle1).isEqualTo(rectangle2);
        rectangle2.setId(2L);
        assertThat(rectangle1).isNotEqualTo(rectangle2);
        rectangle1.setId(null);
        assertThat(rectangle1).isNotEqualTo(rectangle2);
    }
}
