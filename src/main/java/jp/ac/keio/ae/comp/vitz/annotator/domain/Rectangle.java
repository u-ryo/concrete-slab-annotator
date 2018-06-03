package jp.ac.keio.ae.comp.vitz.annotator.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * A Rectangle.
 */
@Entity
@Table(name = "rectangle")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Rectangle implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "x", nullable = false)
    private Integer x;

    @NotNull
    @Column(name = "y", nullable = false)
    private Integer y;

    @NotNull
    @Column(name = "width", nullable = false)
    private Integer width;

    @NotNull
    @Column(name = "height", nullable = false)
    private Integer height;

    @Column(name = "coordinate_x")
    private Integer coordinateX;

    @Column(name = "coordinate_y")
    private Integer coordinateY;

    @Column(name = "pending")
    private Boolean pending;

    @Column(name = "jhi_comment")
    private String comment;

    @ManyToOne
    private Annotation annotation;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getX() {
        return x;
    }

    public Rectangle x(Integer x) {
        this.x = x;
        return this;
    }

    public void setX(Integer x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public Rectangle y(Integer y) {
        this.y = y;
        return this;
    }

    public void setY(Integer y) {
        this.y = y;
    }

    public Integer getWidth() {
        return width;
    }

    public Rectangle width(Integer width) {
        this.width = width;
        return this;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public Rectangle height(Integer height) {
        this.height = height;
        return this;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getCoordinateX() {
        return coordinateX;
    }

    public Rectangle coordinateX(Integer coordinateX) {
        this.coordinateX = coordinateX;
        return this;
    }

    public void setCoordinateX(Integer coordinateX) {
        this.coordinateX = coordinateX;
    }

    public Integer getCoordinateY() {
        return coordinateY;
    }

    public Rectangle coordinateY(Integer coordinateY) {
        this.coordinateY = coordinateY;
        return this;
    }

    public void setCoordinateY(Integer coordinateY) {
        this.coordinateY = coordinateY;
    }

    public Boolean isPending() {
        return pending;
    }

    public Rectangle pending(Boolean pending) {
        this.pending = pending;
        return this;
    }

    public void setPending(Boolean pending) {
        this.pending = pending;
    }

    public String getComment() {
        return comment;
    }

    public Rectangle comment(String comment) {
        this.comment = comment;
        return this;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Annotation getAnnotation() {
        return annotation;
    }

    public Rectangle annotation(Annotation annotation) {
        this.annotation = annotation;
        return this;
    }

    public void setAnnotation(Annotation annotation) {
        this.annotation = annotation;
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
        Rectangle rectangle = (Rectangle) o;
        if (rectangle.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), rectangle.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Rectangle{" +
            "id=" + getId() +
            ", x=" + getX() +
            ", y=" + getY() +
            ", width=" + getWidth() +
            ", height=" + getHeight() +
            ", coordinateX=" + getCoordinateX() +
            ", coordinateY=" + getCoordinateY() +
            ", pending='" + isPending() + "'" +
            ", comment='" + getComment() + "'" +
            "}";
    }
}
