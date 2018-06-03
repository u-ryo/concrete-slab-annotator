package jp.ac.keio.ae.comp.vitz.annotator.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import jp.ac.keio.ae.comp.vitz.annotator.domain.enumeration.DefectName;

/**
 * A Annotation.
 */
@Entity
@Table(name = "annotation")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Annotation implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "square_size", nullable = false)
    private Integer squareSize;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "defect", nullable = false)
    private DefectName defect;

    @OneToMany(mappedBy = "annotation")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Rectangle> rectangles = new HashSet<>();

    @ManyToOne
    private Image image;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSquareSize() {
        return squareSize;
    }

    public Annotation squareSize(Integer squareSize) {
        this.squareSize = squareSize;
        return this;
    }

    public void setSquareSize(Integer squareSize) {
        this.squareSize = squareSize;
    }

    public DefectName getDefect() {
        return defect;
    }

    public Annotation defect(DefectName defect) {
        this.defect = defect;
        return this;
    }

    public void setDefect(DefectName defect) {
        this.defect = defect;
    }

    public Set<Rectangle> getRectangles() {
        return rectangles;
    }

    public Annotation rectangles(Set<Rectangle> rectangles) {
        this.rectangles = rectangles;
        return this;
    }

    public Annotation addRectangles(Rectangle rectangle) {
        this.rectangles.add(rectangle);
        rectangle.setAnnotation(this);
        return this;
    }

    public Annotation removeRectangles(Rectangle rectangle) {
        this.rectangles.remove(rectangle);
        rectangle.setAnnotation(null);
        return this;
    }

    public void setRectangles(Set<Rectangle> rectangles) {
        this.rectangles = rectangles;
    }

    public Image getImage() {
        return image;
    }

    public Annotation image(Image image) {
        this.image = image;
        return this;
    }

    public void setImage(Image image) {
        this.image = image;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Annotation annotation = (Annotation) o;
        if (annotation.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), annotation.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Annotation{" +
            "id=" + getId() +
            ", squareSize=" + getSquareSize() +
            ", defect='" + getDefect() + "'" +
            "}";
    }
}
